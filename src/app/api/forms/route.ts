import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { createFormSchema } from '@/types';
import { generateIdentifier, generateIdentifierHash } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();

    // Validate input
    const validatedData = createFormSchema.parse(body);

    // Generate identifier and hash
    const identifier = generateIdentifier();
    const identifierhash = generateIdentifierHash(identifier);

    // Create form with fields
    const form = await prisma.form.create({
      data: {
        title: validatedData.title,
        type: validatedData.type,
        description: validatedData.description,
        identifier,
        identifierhash,
        userId,
        status: 'ACTIVE',
        fields: {
          create: validatedData.fields.map((field) => ({
            field: field.field,
            answerType: field.answerType,
            answerSubtype: field.answerSubtype,
            required: field.required,
            placeholder: field.placeholder,
            order: field.order,
            status: 'ACTIVE',
            expectedAnswers: field.expectedAnswers
              ? {
                  create: field.expectedAnswers.map((answer) => ({
                    answer: answer.answer,
                    order: answer.order,
                    status: 'ACTIVE',
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        fields: {
          include: {
            expectedAnswers: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Form created successfully',
        data: form,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating form:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const forms = await prisma.form.findMany({
      where: { userId },
      include: {
        _count: {
          select: { replies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
