import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { submissionSchema } from '@/lib/validation';
import { batchGradeShortAnswers } from '@/lib/ai-service';
import { logger } from '@/lib/logger';

interface Question {
  id: string;
  type: string;
  text: string;
  correct_answer?: string;
  max_score: number;
  grading_criteria?: string;
  options?: string[];
}

interface Answer {
  question_id: string;
  answer: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { app_id, applicant_id, membership_id, answers } = parsed.data;

    const application = await db.application.findUnique({ where: { id: app_id } });
    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const questions: Question[] = JSON.parse(application.questions_json || '[]');
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers: Array<Answer & { score: number; max_score: number; feedback?: string }> = [];

    // Grade auto-gradable questions
    const shortAnswerItems: Array<{ index: number; question: string; answer: string; criteria: string; max_score: number }> = [];

    for (const ans of answers) {
      const question = questionMap.get(ans.question_id);
      if (!question) continue;

      maxScore += question.max_score;

      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const isCorrect = ans.answer === question.correct_answer;
        const score = isCorrect ? question.max_score : 0;
        totalScore += score;
        gradedAnswers.push({ ...ans, score, max_score: question.max_score });
      } else if (question.type === 'short_answer') {
        shortAnswerItems.push({
          index: gradedAnswers.length,
          question: question.text,
          answer: ans.answer,
          criteria: question.grading_criteria || '',
          max_score: question.max_score,
        });
        gradedAnswers.push({ ...ans, score: 0, max_score: question.max_score });
      }
    }

    // AI grade short answers
    if (shortAnswerItems.length > 0) {
      try {
        const gradeResults = await batchGradeShortAnswers(
          shortAnswerItems.map((item) => ({
            questionId: item.index.toString(),
            questionText: item.question,
            answer: item.answer,
            maxScore: item.max_score,
            gradingCriteria: item.criteria,
          }))
        );

        for (let i = 0; i < gradeResults.length; i++) {
          const item = shortAnswerItems[i];
          const result = gradeResults[i];
          gradedAnswers[item.index].score = result.score;
          gradedAnswers[item.index].feedback = result.feedback;
          totalScore += result.score;
        }
      } catch (gradeError) {
        logger.error('AI grading failed, using zero scores for short answers', gradeError);
      }
    }

    const passed = totalScore >= (application.pass_score || 70);

    const submission = await db.applicationSubmission.create({
      data: {
        application_id: app_id,
        roblox_user_id: String(applicant_id),
        membership_id: membership_id || null,
        answers_json: JSON.stringify(gradedAnswers),
        score: totalScore,
        max_score: maxScore,
        passed,
        feedback: passed ? 'Application passed' : 'Application did not meet the passing score',
      },
    });

    logger.info('Submission graded', { submissionId: submission.id, score: totalScore, passed });

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        score: totalScore,
        max_score: maxScore,
        passed,
        feedback: submission.feedback,
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('Submission error', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
