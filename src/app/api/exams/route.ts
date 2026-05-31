import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, questions, settings, share_token, created_by, org_id, file_id } = body;

    // Create the FileItem first
    const file = await db.fileItem.create({
      data: {
        name: title || 'Untitled Exam',
        type: 'exam',
        owner_id: created_by || 'usr-1',
        org_id: org_id || null,
        content: JSON.stringify({ questions, settings }),
      },
    });

    const exam = await db.exam.create({
      data: {
        file_id: file.id,
        title: title || 'Untitled Exam',
        description: description || null,
        questions: JSON.stringify(questions || []),
        settings: JSON.stringify(settings || {}),
        share_token: share_token || crypto.randomUUID(),
        created_by: created_by || 'usr-1',
        org_id: org_id || null,
      },
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('token');

    if (shareToken) {
      const exam = await db.exam.findUnique({
        where: { share_token: shareToken },
        include: { submissions: true },
      });
      if (!exam) return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
      return NextResponse.json(exam);
    }

    const exams = await db.exam.findMany({
      orderBy: { updated_at: 'desc' },
      include: { submissions: true },
    });
    return NextResponse.json(exams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}
