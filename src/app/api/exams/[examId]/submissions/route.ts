import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const body = await request.json();
    const { respondent_name, respondent_email, answers, score, total_points } = body;

    // Verify exam exists
    const exam = await db.exam.findUnique({ where: { id: examId } });
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });

    const submission = await db.examSubmission.create({
      data: {
        exam_id: examId,
        respondent_name,
        respondent_email,
        answers: JSON.stringify(answers || {}),
        score: score !== undefined ? score : null,
        total_points: total_points ?? null,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const submissions = await db.examSubmission.findMany({
      where: { exam_id: examId },
      orderBy: { submitted_at: 'desc' },
    });
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
