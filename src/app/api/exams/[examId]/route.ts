import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const exam = await db.exam.findUnique({
      where: { id: examId },
      include: { submissions: true },
    });
    if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ error: 'Failed to fetch exam' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    const body = await request.json();
    const { title, description, questions, settings, share_token } = body;

    const exam = await db.exam.update({
      where: { id: examId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(questions !== undefined && { questions: JSON.stringify(questions) }),
        ...(settings !== undefined && { settings: JSON.stringify(settings) }),
        ...(share_token !== undefined && { share_token }),
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error updating exam:', error);
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ examId: string }> }
) {
  try {
    const { examId } = await params;
    await db.exam.delete({ where: { id: examId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting exam:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}
