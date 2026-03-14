import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { signupSchema } from '@/lib/validation';
import { sendVerificationEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, username, password } = parsed.data;

    const existingUser = await db.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return NextResponse.json(
        { success: false, error: `A user with this ${field} already exists` },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);

    const user = await db.user.create({
      data: { email, username, password_hash },
    });

    const token = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.emailVerification.create({
      data: { user_id: user.id, token, expires_at },
    });

    await sendVerificationEmail(email, token);

    logger.info('User signed up', { userId: user.id });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Signup error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
