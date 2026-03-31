// src/auth.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await connectDB();
        const user = await User.findOne({ email: credentials.email }).select('+hashedPassword');

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(String(credentials.password), user.hashedPassword);
        if (!isValid) return null;

        // Streak logic
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;

        if (lastLogin) {
          lastLogin.setHours(0, 0, 0, 0);
          const diff = Math.round((today - lastLogin) / (1000 * 60 * 60 * 24));
          if (diff === 1) user.streak = (user.streak || 0) + 1;
          else if (diff > 1) user.streak = 1;
        } else {
          user.streak = 1;
        }

        user.lastLoginDate = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          xp: user.xp || 0,
          level: user.level || 1,
          streak: user.streak || 0,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
});