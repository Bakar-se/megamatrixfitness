import { verifyPassword } from "@/lib/authHelper";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { atob } from "buffer";
import { NextApiRequest, NextApiResponse } from "next";
import { NextApiHandler } from "next";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth/";

const authHandler: NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => NextAuth(req, res, options(req));
export default authHandler;
export const options = (req?: NextApiRequest): NextAuthOptions => ({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Email",
          type: "text",
          placeholder: "jsmith",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          let { email, password } = req.body as {
            email: string;
            password: string;
          };
          const dbUser: any = await prisma.user.findFirst({
            where: {
              email: email,
            },
          });
          if (dbUser === null) {
            console.error("No user found for:", email);
            return null;
          }
          const passwordMatch = await verifyPassword(password, dbUser.password);
          if (!passwordMatch) {
            console.error("Incorrect password for user:", email);
            return null;
          }

          return dbUser;
        } catch (error) {
          console.error("Error in user authorization:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 10 * 24 * 60 * 60,
  },
  debug: process.env.ENV !== "PROD",
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  callbacks: {
    async session({ session, token, user }: any) {
      if (session?.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            role: true,
          },
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
          session.user.first_name = dbUser.first_name;
          session.user.last_name = dbUser.last_name;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.steamId = user.steamId;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/404",
  },
});
