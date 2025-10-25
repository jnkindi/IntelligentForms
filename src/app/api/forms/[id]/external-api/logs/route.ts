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
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Verify form belongs to user
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Get external API for this form
    const externalApi = await prisma.externalApi.findFirst({
      where: { formId },
    });

    if (!externalApi) {
      return NextResponse.json({
        success: true,
        data: { logs: [], externalApi: null },
      });
    }

    // Get logs
    const logs = await prisma.externalApiLog.findMany({
      where: { externalApiId: externalApi.id },
      include: {
        replier: {
          select: {
            id: true,
            date: true,
            ipAddress: true,
          },
        },
      },
      orderBy: { executedAt: 'desc' },
      take: 100, // Limit to last 100 logs
    });

    return NextResponse.json({
      success: true,
      data: {
        logs,
        externalApi: {
          id: externalApi.id,
          url: externalApi.url,
          method: externalApi.method,
          enabled: externalApi.enabled,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching API logs:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
