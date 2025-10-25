import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { updateUserSchema } from '@/types';
import bcrypt from 'bcryptjs';

// GET user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);

    // Users can view their own profile, or ADMIN/MANAGER can view any
    if (
      parseInt(session.user.id) !== userId &&
      session.user.role !== 'ADMIN' &&
      session.user.role !== 'MANAGER'
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        names: true,
        email: true,
        title: true,
        role: true,
        isActive: true,
        address: true,
        twitter: true,
        facebook: true,
        linkedin: true,
        about: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
        formAccess: {
          include: {
            form: {
              select: {
                id: true,
                title: true,
                type: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    // Check permissions
    const isSelf = parseInt(session.user.id) === userId;
    const isAdmin = session.user.role === 'ADMIN';
    const isManager = session.user.role === 'MANAGER';

    // Users can update their own profile (except role and isActive)
    // ADMIN can update anyone
    // MANAGER can update USER role only (not ADMIN or MANAGER)
    if (!isSelf && !isAdmin && !isManager) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get target user to check their role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent self-role change and self-deactivation
    if (isSelf) {
      if (data.role) {
        return NextResponse.json(
          { error: 'You cannot change your own role' },
          { status: 403 }
        );
      }
      if (data.isActive === false) {
        return NextResponse.json(
          { error: 'You cannot deactivate your own account' },
          { status: 403 }
        );
      }
    }

    // MANAGERs cannot modify ADMIN or MANAGER users
    if (isManager && !isAdmin) {
      if (targetUser.role !== 'USER') {
        return NextResponse.json(
          { error: 'Managers can only modify users with USER role' },
          { status: 403 }
        );
      }
      // MANAGERs cannot change roles
      if (data.role) {
        return NextResponse.json(
          { error: 'Managers cannot change user roles' },
          { status: 403 }
        );
      }
    }

    // Handle password update if provided
    const updateData: any = { ...data };
    if (body.password && isSelf) {
      // Only allow password change for self
      const hashedPassword = await bcrypt.hash(body.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        names: true,
        email: true,
        title: true,
        role: true,
        isActive: true,
        address: true,
        twitter: true,
        facebook: true,
        linkedin: true,
        about: true,
        createdAt: true,
        updatedAt: true,
        organizationId: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Update user error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update user', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE user (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN can delete users
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const userId = parseInt(params.id);

    // Prevent self-deletion
    if (parseInt(session.user.id) === userId) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascades will handle form access)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user', details: error.message },
      { status: 500 }
    );
  }
}
