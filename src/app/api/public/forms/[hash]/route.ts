import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;

    const form = await prisma.form.findFirst({
      where: {
        identifierhash: hash,
        status: 'ACTIVE',
      },
      include: {
        fields: {
          where: { status: 'ACTIVE' },
          include: {
            expectedAnswers: {
              where: { status: 'ACTIVE' },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { message: 'Form not found or is inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error fetching public form:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
