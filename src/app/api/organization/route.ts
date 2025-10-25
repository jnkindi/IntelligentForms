import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { updateOrganizationSchema } from '@/types';

// GET organization details
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const organization = await prisma.organization.findFirst();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization', details: error.message },
      { status: 500 }
    );
  }
}

// UPDATE organization (ADMIN only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is ADMIN
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = updateOrganizationSchema.parse(body);

    const organization = await prisma.organization.findFirst();

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    const updated = await prisma.organization.update({
      where: { id: organization.id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: 'Organization updated successfully',
      data: updated,
    });
  } catch (error: any) {
    console.error('Update organization error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update organization', details: error.message },
      { status: 500 }
    );
  }
}
