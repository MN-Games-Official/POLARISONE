import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c) => {
        const [key, ...val] = c.trim().split('=');
        return [key, val.join('=')];
      })
    );

    const refreshToken = cookies['refresh_token'];
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'No refresh token' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, username: true, full_name: true, avatar_url: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    logger.error('Refresh token error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
