import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { applicationSchema } from '@/lib/validation';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const application = await db.application.findFirst({
      where: { id, user_id: user.userId },
      include: { _count: { select: { submissions: true } } },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application });
  } catch (error) {
    logger.error('Get application error', error);
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
    const parsed = applicationSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const existing = await db.application.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const { questions, ...rest } = parsed.data;
    const updateData: Record<string, unknown> = { ...rest };
    if (questions !== undefined) {
      updateData.questions_json = JSON.stringify(questions);
    }

    const application = await db.application.update({
      where: { id },
      data: updateData,
    });

    logger.info('Application updated', { appId: id });
    return NextResponse.json({ success: true, application });
  } catch (error) {
    logger.error('Update application error', error);
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

    const existing = await db.application.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    await db.application.delete({ where: { id } });

    logger.info('Application deleted', { appId: id });
    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    logger.error('Delete application error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
