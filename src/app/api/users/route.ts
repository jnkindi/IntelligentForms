import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { createUserSchema } from '@/types';
import bcrypt from 'bcryptjs';

// GET all users (ADMIN and MANAGER only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ADMIN or MANAGER
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const users = await prisma.user.findMany({
      where: includeInactive ? undefined : { isActive: true },
      select: {
        id: true,
        names: true,
        email: true,
        title: true,
        role: true,
        isActive: true,
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error.message },
      { status: 500 }
    );
  }
}

// CREATE new user (ADMIN and MANAGER only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ADMIN or MANAGER
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden: Admin or Manager access required' },
        { status: 403 }
      );
    }

    // MANAGERs can only create USERs, not ADMINs or MANAGERs
    const body = await request.json();
    const data = createUserSchema.parse(body);

    if (session.user.role === 'MANAGER' && data.role !== 'USER') {
      return NextResponse.json(
        { error: 'Managers can only create users with USER role' },
        { status: 403 }
      );
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Get organization ID
    const currentUser = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: { organizationId: true },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        organizationId: currentUser?.organizationId,
        names: data.names,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        title: data.title,
        isActive: true,
      },
      select: {
        id: true,
        names: true,
        email: true,
        title: true,
        role: true,
        isActive: true,
        createdAt: true,
        organizationId: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
  } catch (error: any) {
    console.error('Create user error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}
