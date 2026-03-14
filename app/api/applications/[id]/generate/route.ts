import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { generateApplicationForm } from '@/lib/ai-service';
import { logger } from '@/lib/logger';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await getUserFromToken(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const application = await db.application.findFirst({
      where: { id, user_id: user.userId },
    });

    if (!application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const questionCount = body.questionCount || 5;

    const questions = await generateApplicationForm({
      groupName: application.name,
      roleName: application.target_role,
      description: application.description || '',
      questionCount,
    });

    await db.application.update({
      where: { id },
      data: { questions_json: JSON.stringify(questions) },
    });

    logger.info('AI questions generated', { appId: id, count: questions.length });

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    logger.error('Generate application error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
