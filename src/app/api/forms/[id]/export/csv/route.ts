import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Get form with replies
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        replies: {
          include: {
            replies: {
              include: {
                field: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Build CSV content
    const headers = [
      'Submission ID',
      'Date',
      'IP Address',
      ...form.fields.map((field) => field.field),
    ];

    const rows = form.replies.map((replier) => {
      const fieldAnswers = form.fields.map((field) => {
        const reply = replier.replies.find((r) => r.fieldId === field.id);
        return reply?.answer || '';
      });

      return [
        replier.id.toString(),
        new Date(replier.date).toISOString(),
        replier.ipAddress || '',
        ...fieldAnswers,
      ];
    });

    // Convert to CSV format
    const csvContent = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${form.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()}_submissions_${Date.now()}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}
