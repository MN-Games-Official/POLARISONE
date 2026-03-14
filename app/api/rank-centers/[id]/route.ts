import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { rankCenterSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const rankCenter = await db.rankCenter.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!rankCenter) {
      return NextResponse.json({ success: false, error: 'Rank center not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, rankCenter });
  } catch (error) {
    logger.error('Get rank center error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = rankCenterSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await db.rankCenter.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Rank center not found' }, { status: 404 });
    }

    const { ranks, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (ranks !== undefined) {
      updateData.ranks_json = JSON.stringify(ranks);
    }

    const rankCenter = await db.rankCenter.update({
      where: { id },
      data: updateData,
    });

    logger.info('Rank center updated', { rcId: id });
    return NextResponse.json({ success: true, rankCenter });
  } catch (error) {
    logger.error('Update rank center error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const existing = await db.rankCenter.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Rank center not found' }, { status: 404 });
    }

    await db.rankCenter.delete({ where: { id } });

    logger.info('Rank center deleted', { rcId: id });
    return NextResponse.json({ success: true, message: 'Rank center deleted' });
  } catch (error) {
    logger.error('Delete rank center error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
