import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database';
import bcrypt from 'bcryptjs';
import { setupOrganizationSchema } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Check if organization already exists
    const existingOrg = await prisma.organization.findFirst();

    if (existingOrg && existingOrg.setupCompleted) {
      return NextResponse.json(
        { error: 'Organization setup has already been completed' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const data = setupOrganizationSchema.parse(body);

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.adminPassword, 10);

    // Create organization and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create or update organization
      let organization;
      if (existingOrg) {
        organization = await tx.organization.update({
          where: { id: existingOrg.id },
          data: {
            name: data.name,
            description: data.description,
            tagline: data.tagline,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            supportEmail: data.supportEmail,
            website: data.website,
            address: data.address,
            setupCompleted: true,
          },
        });
      } else {
        organization = await tx.organization.create({
          data: {
            name: data.name,
            description: data.description,
            tagline: data.tagline,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone,
            supportEmail: data.supportEmail,
            website: data.website,
            address: data.address,
            setupCompleted: true,
          },
        });
      }

      // Create admin user
      const admin = await tx.user.create({
        data: {
          organizationId: organization.id,
          names: data.adminName,
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });

      return { organization, admin };
    });

    return NextResponse.json({
      success: true,
      message: 'Organization setup completed successfully',
      data: {
        organization: {
          id: result.organization.id,
          name: result.organization.name,
        },
        admin: {
          id: result.admin.id,
          email: result.admin.email,
          names: result.admin.names,
        },
      },
    });
  } catch (error: any) {
    console.error('Organization setup error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to setup organization', details: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check setup status
export async function GET() {
  try {
    const organization = await prisma.organization.findFirst();

    return NextResponse.json({
      success: true,
      data: {
        setupCompleted: organization?.setupCompleted || false,
        organization: organization
          ? {
              id: organization.id,
              name: organization.name,
              description: organization.description,
              tagline: organization.tagline,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error('Setup status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check setup status', details: error.message },
      { status: 500 }
    );
  }
}
