import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken, hashPassword, verifyPassword } from '@/lib/auth';
import { changePasswordSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { current_password, new_password } = parsed.data;

    const dbUser = await db.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const valid = await verifyPassword(current_password, dbUser.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(new_password);
    await db.user.update({
      where: { id: user.userId },
      data: { password_hash },
    });

    logger.info('Password changed', { userId: user.userId });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    logger.error('Change password error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
