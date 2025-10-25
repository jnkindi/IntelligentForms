import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { updateFormAccessSchema } from '@/types';

// UPDATE form access level
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and MANAGER can update access
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      );
    }

    const accessId = parseInt(params.id);
    const body = await request.json();
    const data = updateFormAccessSchema.parse(body);

    // Get the access record
    const existingAccess = await prisma.formAccess.findUnique({
      where: { id: accessId },
      include: {
        user: {
          select: { role: true },
        },
      },
    });

    if (!existingAccess) {
      return NextResponse.json(
        { error: 'Form access record not found' },
        { status: 404 }
      );
    }

    // MANAGERs can only modify access for USERs
    if (
      session.user.role === 'MANAGER' &&
      existingAccess.user.role !== 'USER'
    ) {
      return NextResponse.json(
        { error: 'Managers can only modify access for users with USER role' },
        { status: 403 }
      );
    }

    // Update access level
    const updatedAccess = await prisma.formAccess.update({
      where: { id: accessId },
      data: { access: data.access },
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
      message: 'Form access updated successfully',
      data: updatedAccess,
    });
  } catch (error: any) {
    console.error('Update form access error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update form access', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE (revoke) form access
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN and MANAGER can revoke access
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      );
    }

    const accessId = parseInt(params.id);

    // Get the access record
    const existingAccess = await prisma.formAccess.findUnique({
      where: { id: accessId },
      include: {
        user: {
          select: { role: true },
        },
      },
    });

    if (!existingAccess) {
      return NextResponse.json(
        { error: 'Form access record not found' },
        { status: 404 }
      );
    }

    // MANAGERs can only revoke access from USERs
    if (
      session.user.role === 'MANAGER' &&
      existingAccess.user.role !== 'USER'
    ) {
      return NextResponse.json(
        { error: 'Managers can only revoke access from users with USER role' },
        { status: 403 }
      );
    }

    // Delete the access record
    await prisma.formAccess.delete({
      where: { id: accessId },
    });

    return NextResponse.json({
      success: true,
      message: 'Form access revoked successfully',
    });
  } catch (error: any) {
    console.error('Delete form access error:', error);
    return NextResponse.json(
      { error: 'Failed to revoke form access', details: error.message },
      { status: 500 }
    );
  }
}
