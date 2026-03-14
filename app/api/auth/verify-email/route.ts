import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const verification = await db.emailVerification.findFirst({
      where: { token, used: false, expires_at: { gt: new Date() } },
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    await db.$transaction([
      db.user.update({
        where: { id: verification.user_id },
        data: { email_verified: true, email_verified_at: new Date() },
      }),
      db.emailVerification.update({
        where: { id: verification.id },
        data: { used: true },
      }),
    ]);

    logger.info('Email verified', { userId: verification.user_id });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    logger.error('Email verification error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
