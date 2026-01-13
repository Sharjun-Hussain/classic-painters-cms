export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnRoot = nextUrl.pathname === '/';

            if (isOnRoot) {
                if (isLoggedIn) return Response.redirect(new URL('/admin', nextUrl));
                return Response.redirect(new URL('/login', nextUrl));
            }

            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && nextUrl.pathname === '/login') {
                return Response.redirect(new URL('/admin', nextUrl));
            }
            return true;
        },
    },
    providers: [], // Configured in auth.js
    trustHost: true, // Important: Allows NextAuth to work on Vercel with dynamic URLs
};
