const SESSION_KEY = 'nexus_session_token';
const ACCESS_KEY = 'nexus_access_token';
const AUTH_COOKIE = 'nexus_auth'; // JS-accessible cookie for middleware

export const tokenStore = {
    set(sessionToken: string, accessToken: string) {
        localStorage.setItem(SESSION_KEY, sessionToken);
        localStorage.setItem(ACCESS_KEY, accessToken);
        // set a JS-accessible cookie so Next.js middleware can check auth
        document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${60 * 60 * 24}`;
    },

    getSession(): string | null {
        return localStorage.getItem(SESSION_KEY);
    },

    getAccess(): string | null {
        return localStorage.getItem(ACCESS_KEY);
    },

    clear() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(ACCESS_KEY);
        document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0`;
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem(SESSION_KEY);
    },
};
