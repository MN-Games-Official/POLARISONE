import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { encryptKey } from '@/lib/encryption';
import { robloxApiKeySchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await db.apiKey.findFirst({
      where: { user_id: user.userId, type: 'roblox', is_active: true },
      select: { id: true, key_prefix: true, created_at: true, last_used: true },
    });

    return NextResponse.json({
      success: true,
      hasKey: !!apiKey,
      apiKey: apiKey || null,
    });
  } catch (error) {
    logger.error('Get roblox key error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = robloxApiKeySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { api_key } = parsed.data;
    const encrypted_key = await encryptKey(api_key);
    const key_prefix = api_key.substring(0, 8) + '...';

    // Deactivate existing roblox keys
    await db.apiKey.updateMany({
      where: { user_id: user.userId, type: 'roblox', is_active: true },
      data: { is_active: false },
    });

    const apiKey = await db.apiKey.create({
      data: {
        user_id: user.userId,
        type: 'roblox',
        encrypted_key,
        key_prefix,
        is_active: true,
      },
    });

    logger.info('Roblox API key saved', { userId: user.userId });

    return NextResponse.json({
      success: true,
      apiKey: { id: apiKey.id, key_prefix: apiKey.key_prefix, created_at: apiKey.created_at },
    }, { status: 201 });
  } catch (error) {
    logger.error('Save roblox key error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await db.apiKey.updateMany({
      where: { user_id: user.userId, type: 'roblox', is_active: true },
      data: { is_active: false },
    });

    logger.info('Roblox API key removed', { userId: user.userId });
    return NextResponse.json({ success: true, message: 'API key removed' });
  } catch (error) {
    logger.error('Delete roblox key error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
