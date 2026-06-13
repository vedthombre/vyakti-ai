import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    CredentialsProvider({
      id: "firebase-phone",
      name: "Phone Number",
      credentials: {
        uid: { label: "UID", type: "text" },
        phone: { label: "Phone Number", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.uid || !credentials?.phone) {
          return null;
        }
        
        // Trusting the client-side Firebase verification for this prototype.
        // In a strict production environment, you would send the Firebase ID Token
        // and verify it using Firebase Admin SDK here.
        return {
          id: credentials.uid as string,
          name: credentials.phone as string, 
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  }
});
