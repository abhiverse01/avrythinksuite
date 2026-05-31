import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const exam = await db.exam.findUnique({ where: { id: examId } });
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const submissions = await db.examSubmission.findMany({
      where: { exam_id: examId },
    });

    const questions = JSON.parse(exam.questions) as Array<{
      id: string;
      text: string;
      type: string;
      options?: Array<{ text: string }>;
      correctAnswer?: string | string[];
    }>;

    const totalResponses = submissions.length;
    const scoredSubs = submissions.filter((s) => s.score !== null);
    const avgScore = scoredSubs.length > 0
      ? scoredSubs.reduce((sum, s) => sum + (s.score as number), 0) / scoredSubs.length
      : 0;

    // Per-question analytics
    const questionAnalytics = questions
      .filter((q) => q.type !== 'section_header')
      .map((q) => {
        let correct = 0;
        const breakdown: Record<string, number> = {};

        submissions.forEach((s) => {
          const answers = JSON.parse(s.answers) as Record<string, unknown>;
          const answer = answers[q.id];

          if (q.options && typeof answer === 'string') {
            breakdown[answer] = (breakdown[answer] || 0) + 1;
          }

          if (q.correctAnswer !== undefined) {
            const correctAnswer = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
            if (typeof answer === 'string' && correctAnswer.includes(answer)) {
              correct++;
            } else if (Array.isArray(answer) && answer.length === correctAnswer.length && correctAnswer.every((ca) => answer.includes(ca))) {
              correct++;
            }
          }
        });

        return {
          questionId: q.id,
          questionText: q.text,
          questionType: q.type,
          totalResponses,
          correctResponses: correct,
          correctPercentage: totalResponses > 0 ? Math.round((correct / totalResponses) * 100) : 0,
          optionBreakdown: q.options
            ? q.options.map((opt, idx) => ({
                label: opt.text,
                count: breakdown[String.fromCharCode(65 + idx)] || 0,
                percentage: totalResponses > 0 ? Math.round(((breakdown[String.fromCharCode(65 + idx)] || 0) / totalResponses) * 100) : 0,
              }))
            : undefined,
        };
      });

    return NextResponse.json({
      totalResponses,
      avgScore: Math.round(avgScore * 10) / 10,
      questionAnalytics,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
