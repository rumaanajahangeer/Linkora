import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(4, 'Password must be at least 4 characters.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Auto-create user if account does not exist
      const defaultName = normalizedEmail.split('@')[0];
      const name = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const passwordHash = await hashPassword(password);

      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
        },
      });
    } else {
      // Verify existing user password
      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password.' },
          { status: 401 }
        );
      }
    }

    // Create session token and set cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
