import { verifyPassword } from '@/lib/authHelper';
import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { atob } from 'buffer';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextApiHandler } from 'next';
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authHandler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  return NextAuth(req, res, options);
};
export default authHandler;
export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        try {
          let { email, password } = req.body as {
            email: string;
            password: string;
          };

          const dbUser = await prisma.user.findFirst({
            where: {
              email
            }
          });
          if (!dbUser) {
            throw new Error('no_user_found');
          }
          if (!dbUser.password) {
            throw new Error('incorrect_password');
          }
          const passwordMatch = await verifyPassword(password, dbUser.password);
          if (!passwordMatch) {
            throw new Error('incorrect_password');
          }
          const user = {
            ...dbUser,
            name: dbUser.first_name + ' ' + dbUser.last_name,
            id: dbUser.id
          };
          return user;
        } catch (error) {
          console.log(error, 'eror while loggin in');

          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60,
    updateAge: 30 * 60
  },
  debug: process.env.ENV !== 'PROD',
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  callbacks: {
    jwt: ({ token, user, profile, trigger, session }) => {
      return { ...token };
    },
    session: async ({ session, token }: any) => {
      const userData = await prisma.user.findUnique({
        where: { id: token.sub }
      });
      if (userData) {
        return {
          ...session,
          user: {
            ...session.user,
            id: userData.id,
            role: userData.role,
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email
          }
        };
      }
    }
  }
};
