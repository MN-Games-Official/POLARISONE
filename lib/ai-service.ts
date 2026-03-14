import { config } from '@/lib/config';
import { logger } from '@/lib/logger';

interface GenerateFormParams {
  groupName: string;
  roleName: string;
  description?: string;
  questionCount?: number;
}

interface GeneratedQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'true_false';
  text: string;
  options?: string[];
  correct_answer?: string;
  max_score: number;
  grading_criteria?: string;
}

interface GradeItem {
  questionId: string;
  questionText: string;
  answer: string;
  maxScore: number;
  gradingCriteria: string;
}

interface GradeResult {
  questionId: string;
  score: number;
  feedback: string;
}

async function callAbacusAI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await fetch(
    `${config.abacusAi.baseUrl}/chat/completions`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.abacusAi.apiKey}`,
      },
      body: JSON.stringify({
        model: config.abacusAi.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    logger.error('Abacus AI API error', errorText);
    throw new Error(`Abacus AI error ${response.status}: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message?.content ?? '';
}

function extractJson<T>(text: string): T {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = match ? match[1].trim() : text.trim();
  return JSON.parse(jsonStr) as T;
}

export async function generateApplicationForm(
  params: GenerateFormParams
): Promise<GeneratedQuestion[]> {
  const systemPrompt = `You are an expert at creating application forms for Roblox groups. Generate questions that effectively evaluate candidates. Respond with ONLY a JSON array of question objects.`;

  const userPrompt = `Generate ${params.questionCount || 5} application questions for a Roblox group.

Group: ${params.groupName}
Role: ${params.roleName}
${params.description ? `Description: ${params.description}` : ''}

Each question must have:
- "id": unique string identifier
- "type": one of "multiple_choice", "short_answer", or "true_false"
- "text": the question text
- "options": array of options (for multiple_choice only)
- "correct_answer": the correct answer (for multiple_choice and true_false)
- "max_score": point value (number)
- "grading_criteria": criteria for grading short answers

Include a mix of question types. Limit short_answer questions to at most 3.
Return ONLY a JSON array, no other text.`;

  const raw = await callAbacusAI(systemPrompt, userPrompt);
  return extractJson<GeneratedQuestion[]>(raw);
}

export async function batchGradeShortAnswers(
  items: GradeItem[]
): Promise<GradeResult[]> {
  const systemPrompt = `You are an expert grader. Grade each answer fairly based on the criteria provided. Respond with ONLY a JSON array of result objects.`;

  const userPrompt = `Grade the following short-answer responses:

${items
  .map(
    (item, i) => `${i + 1}. Question: "${item.questionText}"
   Answer: "${item.answer}"
   Max Score: ${item.maxScore}
   Criteria: ${item.gradingCriteria}`
  )
  .join('\n\n')}

For each answer, return:
- "questionId": the original question ID
- "score": numeric score (0 to max_score)
- "feedback": brief feedback explaining the grade

Question IDs: ${JSON.stringify(items.map((item) => item.questionId))}

Return ONLY a JSON array, no other text.`;

  const raw = await callAbacusAI(systemPrompt, userPrompt);
  return extractJson<GradeResult[]>(raw);
}
