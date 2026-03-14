import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { encryptKey } from '@/lib/encryption';
import { polarisApiKeySchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apiKeys = await db.apiKey.findMany({
      where: { user_id: user.userId, type: 'polaris', is_active: true },
      select: {
        id: true,
        key_prefix: true,
        name: true,
        scopes: true,
        created_at: true,
        last_used: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, apiKeys });
  } catch (error) {
    logger.error('List polaris keys error', error);
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
    const parsed = polarisApiKeySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, scopes } = parsed.data;

    const rawKey = `pol_${crypto.randomBytes(32).toString('hex')}`;
    const key_prefix = rawKey.substring(0, 12) + '...';
    const encrypted_key = await encryptKey(rawKey);

    const apiKey = await db.apiKey.create({
      data: {
        user_id: user.userId,
        type: 'polaris',
        encrypted_key,
        key_prefix,
        name: name || null,
        scopes: scopes ? JSON.stringify(scopes) : null,
        is_active: true,
      },
    });

    logger.info('Polaris API key created', { userId: user.userId, keyId: apiKey.id });

    return NextResponse.json(
      {
        success: true,
        apiKey: {
          id: apiKey.id,
          key: rawKey,
          key_prefix: apiKey.key_prefix,
          name: apiKey.name,
          created_at: apiKey.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Create polaris key error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
