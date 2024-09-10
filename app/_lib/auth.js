import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createGuest, getGuest } from "@/app/_lib/data-service";

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    // if user return true (they are authorized), if not return false and don't allow.
    authorized({ auth, request }) {
      return !!auth?.user;
      // converts to boolean
    },
    async signIn({ user, account, profile }) {
      try {
        // if user signs in and their google account is already in the supabase db
        const existingGuest = await getGuest(user.email);

        // if not create a new guest
        if (!existingGuest)
          await createGuest({
            email: user.email,
            fullName: user.name
          });

        return true;
      } catch {
        return false;
      }
    },
    async session({session, user}) {
      const guest = await getGuest(session.user.email);
      session.user.guestId = guest.id

      return session;

    }
  },
  pages: {
    signIn: "/login",
  },
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(authConfig);
