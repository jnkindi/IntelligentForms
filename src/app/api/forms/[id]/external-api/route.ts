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

    // Get external API config
    const externalApi = await prisma.externalApi.findFirst({
      where: { formId },
      include: {
        fields: true,
      },
    });

    return NextResponse.json({ success: true, data: externalApi });
  } catch (error) {
    console.error('Error fetching external API config:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Verify form belongs to user
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    const { url, method, headers, enabled, fieldMappings } = body;

    // Delete existing config and create new one
    await prisma.externalApi.deleteMany({
      where: { formId },
    });

    const externalApi = await prisma.externalApi.create({
      data: {
        formId,
        url,
        method,
        headers: headers || null,
        enabled,
        fields: {
          create: fieldMappings.map((mapping: any) => ({
            fieldId: mapping.fieldId,
            externalFieldName: mapping.externalFieldName,
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'External API configured successfully',
      data: externalApi,
    });
  } catch (error) {
    console.error('Error configuring external API:', error);
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

    // Verify form belongs to user
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Get existing external API
    const existingApi = await prisma.externalApi.findFirst({
      where: { formId },
    });

    if (!existingApi) {
      return NextResponse.json(
        { message: 'External API configuration not found' },
        { status: 404 }
      );
    }

    const { url, method, headers, enabled, fieldMappings } = body;

    // Update in transaction
    const externalApi = await prisma.$transaction(async (tx) => {
      // Delete old field mappings
      await tx.externalApiField.deleteMany({
        where: { externalApiId: existingApi.id },
      });

      // Update API config
      return await tx.externalApi.update({
        where: { id: existingApi.id },
        data: {
          url: url !== undefined ? url : existingApi.url,
          method: method !== undefined ? method : existingApi.method,
          headers: headers !== undefined ? headers : existingApi.headers,
          enabled: enabled !== undefined ? enabled : existingApi.enabled,
          fields: {
            create: fieldMappings?.map((mapping: any) => ({
              fieldId: mapping.fieldId,
              externalFieldName: mapping.externalFieldName,
            })) || [],
          },
        },
        include: {
          fields: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'External API updated successfully',
      data: externalApi,
    });
  } catch (error) {
    console.error('Error updating external API:', error);
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

    // Verify form belongs to user
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
    });

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Delete external API configuration
    await prisma.externalApi.deleteMany({
      where: { formId },
    });

    return NextResponse.json({
      success: true,
      message: 'External API configuration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting external API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
