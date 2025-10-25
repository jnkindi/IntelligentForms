import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { assignFormAccessSchema } from '@/types';

// GET form access records
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and MANAGER can view access records
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const formId = searchParams.get('formId');

    const where: any = {};
    if (userId) where.userId = parseInt(userId);
    if (formId) where.formId = parseInt(formId);

    const accessRecords = await prisma.formAccess.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
            role: true,
            isActive: true,
          },
        },
        form: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: accessRecords,
    });
  } catch (error: any) {
    console.error('Get form access error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form access records', details: error.message },
      { status: 500 }
    );
  }
}

// ASSIGN form access to user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and MANAGER can assign access
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = assignFormAccessSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // MANAGERs can only assign access to USERs
    if (session.user.role === 'MANAGER' && user.role !== 'USER') {
      return NextResponse.json(
        { error: 'Managers can only assign access to users with USER role' },
        { status: 403 }
      );
    }

    // If formId is provided, check if form exists
    if (data.formId) {
      const form = await prisma.form.findUnique({
        where: { id: data.formId },
        select: { id: true },
      });

      if (!form) {
        return NextResponse.json({ error: 'Form not found' }, { status: 404 });
      }
    }

    // Check if access already exists
    const existing = await prisma.formAccess.findFirst({
      where: {
        userId: data.userId,
        formId: data.formId || null,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Form access already exists for this user' },
        { status: 400 }
      );
    }

    // Create form access
    const formAccess = await prisma.formAccess.create({
      data: {
        userId: data.userId,
        formId: data.formId || null,
        access: data.access,
      },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            email: true,
          },
        },
        form: {
          select: {
            id: true,
            title: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Form access assigned successfully',
      data: formAccess,
    });
  } catch (error: any) {
    console.error('Assign form access error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assign form access', details: error.message },
      { status: 500 }
    );
  }
}
