import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database';
import bcrypt from 'bcryptjs';
import { signUpSchema } from '@/types';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        names: validatedData.names,
        email: validatedData.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        names: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        data: user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);

    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      return NextResponse.json(
        { message: 'Validation error', errors: fieldErrors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
