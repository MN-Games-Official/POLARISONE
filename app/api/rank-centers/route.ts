import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { rankCenterSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const rankCenters = await db.rankCenter.findMany({
      where: { user_id: user.userId },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, rankCenters });
  } catch (error) {
    logger.error('List rank centers error', error);
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
    const parsed = rankCenterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, group_id, universe_id, ranks } = parsed.data;

    const rankCenter = await db.rankCenter.create({
      data: {
        user_id: user.userId,
        name,
        group_id,
        universe_id: universe_id || null,
        ranks_json: JSON.stringify(ranks || []),
      },
    });

    logger.info('Rank center created', { userId: user.userId, rcId: rankCenter.id });

    return NextResponse.json({ success: true, rankCenter }, { status: 201 });
  } catch (error) {
    logger.error('Create rank center error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
