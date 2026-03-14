import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, new_password } = parsed.data;

    const resetRecord = await db.passwordReset.findFirst({
      where: { token, used: false, expires_at: { gt: new Date() } },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(new_password);

    await db.$transaction([
      db.user.update({
        where: { id: resetRecord.user_id },
        data: { password_hash },
      }),
      db.passwordReset.update({
        where: { id: resetRecord.id },
        data: { used: true },
      }),
    ]);

    logger.info('Password reset completed', { userId: resetRecord.user_id });

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    logger.error('Password reset error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
