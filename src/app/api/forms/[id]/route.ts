import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { updateFormSchema } from '@/types';

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

    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
      include: {
        fields: {
          include: {
            expectedAnswers: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error fetching form:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const body = await request.json();

    // Validate input
    const validatedData = updateFormSchema.parse(body);

    // Check if form belongs to user
    const existingForm = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!existingForm) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Update form
    const updatedForm = await prisma.form.update({
      where: { id: formId },
      data: validatedData,
    });

    return NextResponse.json({
      success: true,
      message: 'Form updated successfully',
      data: updatedForm,
    });
  } catch (error) {
    console.error('Error updating form:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if form belongs to user
    const existingForm = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!existingForm) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Delete form (cascades to fields, replies, etc.)
    await prisma.form.delete({
      where: { id: formId },
    });

    return NextResponse.json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting form:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
