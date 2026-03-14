import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { encryptKey } from '@/lib/encryption';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'API key ID is required' },
        { status: 400 }
      );
    }

    const existing = await db.apiKey.findFirst({
      where: { id: Number(id), user_id: user.userId, type: 'polaris', is_active: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'API key not found' },
        { status: 404 }
      );
    }

    // Revoke old key
    await db.apiKey.update({
      where: { id: existing.id },
      data: { is_active: false },
    });

    // Generate new key
    const rawKey = `pol_${crypto.randomBytes(32).toString('hex')}`;
    const key_prefix = rawKey.substring(0, 12) + '...';
    const encrypted_key = await encryptKey(rawKey);

    const apiKey = await db.apiKey.create({
      data: {
        user_id: user.userId,
        type: 'polaris',
        encrypted_key,
        key_prefix,
        name: existing.name,
        scopes: existing.scopes,
        is_active: true,
      },
    });

    logger.info('Polaris API key regenerated', { userId: user.userId, oldKeyId: existing.id, newKeyId: apiKey.id });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey.id,
        key: rawKey,
        key_prefix: apiKey.key_prefix,
        name: apiKey.name,
        created_at: apiKey.created_at,
      },
    });
  } catch (error) {
    logger.error('Regenerate polaris key error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
