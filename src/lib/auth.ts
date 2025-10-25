import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/database';
import bcrypt from 'bcryptjs';
import { signInSchema } from '@/types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate credentials
          const { email, password } = signInSchema.parse(credentials);

          // Find user
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user is active
          if (!user.isActive) {
            throw new Error('Your account has been deactivated. Please contact an administrator.');
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.password);

          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.names,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
