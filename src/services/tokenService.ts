const tokenService = {

    getSessionUserId() {
        const session = this.getSession();
        return session && session.userId ? session.userId : null;
    },

    getSessionToken() {
        const session = this.getSession();
        return session && session.token ? session.token : null;
    },

    getSession() {
        const sessionString = localStorage.getItem('session');
        let session = null;
        if (sessionString) {
            session = JSON.parse(sessionString);
        }
        return session;
    },

    setSession(token: string, userId: number) {
        localStorage.setItem('session', JSON.stringify({ token, userId }));
    },

    removeSession() {
        localStorage.removeItem('session');
    }
};

export default tokenService;