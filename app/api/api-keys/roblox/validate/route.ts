import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { decryptKey } from '@/lib/encryption';
import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await db.apiKey.findFirst({
      where: { user_id: user.userId, type: 'roblox', is_active: true },
    });

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'No Roblox API key found' },
        { status: 404 }
      );
    }

    const decryptedKey = await decryptKey(apiKey.encrypted_key);

    const response = await fetch(`${config.robloxApi.cloudBase}/users/v1/users/authenticated`, {
      headers: { 'x-api-key': decryptedKey },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'API key validation failed',
      });
    }

    await db.apiKey.update({
      where: { id: apiKey.id },
      data: { last_used: new Date() },
    });

    logger.info('Roblox API key validated', { userId: user.userId });

    return NextResponse.json({ success: true, valid: true });
  } catch (error) {
    logger.error('Validate roblox key error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
