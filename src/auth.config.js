// src/auth.config.js
export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        // This allows the middleware to verify the session via JWT
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            return isLoggedIn;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.xp = user.xp;
                token.level = user.level;
                token.streak = user.streak;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.xp = token.xp;
                session.user.level = token.level;
                session.user.streak = token.streak;
            }
            return session;
        },
    },
    providers: [], // Keep this empty here
};