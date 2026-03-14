import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { applicationSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const applications = await db.application.findMany({
      where: { user_id: user.userId },
      include: { _count: { select: { submissions: true } } },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, applications });
  } catch (error) {
    logger.error('List applications error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, group_id, target_role, pass_score, questions, primary_color, secondary_color } = parsed.data;

    const application = await db.application.create({
      data: {
        user_id: user.userId,
        name,
        description: description || null,
        group_id,
        target_role,
        pass_score: pass_score ?? 70,
        primary_color: primary_color || '#ff4b6e',
        secondary_color: secondary_color || '#1a1a2e',
        questions_json: JSON.stringify(questions || []),
      },
    });

    logger.info('Application created', { userId: user.userId, appId: application.id });

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (error) {
    logger.error('Create application error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
