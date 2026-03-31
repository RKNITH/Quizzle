// src/auth.config.js
export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            // Basic authorization logic can live here if preferred
            return !!auth;
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
    providers: [], // Empty array here; we add them in auth.ts
};