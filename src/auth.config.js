// src/auth.config.js
export const authConfig = {
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isProtectedRoute = ['/dashboard', '/topics', '/quiz', '/results', '/leaderboard', '/profile']
                .some(prefix => nextUrl.pathname.startsWith(prefix));

            if (isProtectedRoute && !isLoggedIn) return false;
            return true;
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
    providers: [], // Empty here, filled in auth.js
};