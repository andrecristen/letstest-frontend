export type Organization = {
    id: number;
    name: string;
    slug: string;
    plan: string;
    role: string;
};

export type Session = {
    token: string;
    refreshToken?: string;
    userId: number;
    userName?: string;
    organizationId?: number;
    organizationSlug?: string;
    organizationRole?: string;
    organizations?: Organization[];
};

const tokenProvider = {

    getSessionUserId(): any {
        const session = this.getSession();
        return session && session.userId ? session.userId : null;
    },

    getSessionToken() {
        const session = this.getSession();
        return session && session.token ? session.token : null;
    },

    getRefreshToken() {
        const session = this.getSession();
        return session?.refreshToken ?? null;
    },

    getSessionUserName() {
        const session = this.getSession();
        return session?.userName ?? null;
    },

    getOrganizationId() {
        const session = this.getSession();
        return session?.organizationId ?? null;
    },

    getOrganizationSlug() {
        const session = this.getSession();
        return session?.organizationSlug ?? null;
    },

    getOrganizationRole() {
        const session = this.getSession();
        return session?.organizationRole ?? null;
    },

    getOrganizations(): Organization[] {
        const session = this.getSession();
        return session?.organizations ?? [];
    },

    getSession(): Session | null {
        const sessionString = localStorage.getItem('session');
        if (sessionString) {
            return JSON.parse(sessionString);
        }
        return null;
    },

    setSession(
        token: string,
        refreshToken: string | undefined,
        userId: number,
        userName?: string,
        organizationId?: number,
        organizationSlug?: string,
        organizationRole?: string,
        organizations?: Organization[]
    ) {
        localStorage.setItem('session', JSON.stringify({
            token,
            refreshToken,
            userId,
            userName,
            organizationId,
            organizationSlug,
            organizationRole,
            organizations,
        }));
        if (organizationId) {
            localStorage.setItem('lastOrganizationId', String(organizationId));
        }
    },

    getLastOrganizationId(): number | null {
        const value = localStorage.getItem('lastOrganizationId');
        return value ? Number(value) : null;
    },

    updateOrganization(
        token: string,
        organizationId: number,
        organizationSlug: string,
        organizationRole: string
    ) {
        const session = this.getSession();
        if (session) {
            session.token = token;
            session.organizationId = organizationId;
            session.organizationSlug = organizationSlug;
            session.organizationRole = organizationRole;
            localStorage.setItem('session', JSON.stringify(session));
        }
        localStorage.setItem('lastOrganizationId', String(organizationId));
    },

    updateSessionToken(token: string, refreshToken?: string) {
        const session = this.getSession();
        if (session) {
            session.token = token;
            if (refreshToken) {
                session.refreshToken = refreshToken;
            }
            localStorage.setItem('session', JSON.stringify(session));
        }
    },

    updateOrganizations(organizations: Organization[]) {
        const session = this.getSession();
        if (session) {
            session.organizations = organizations;
            localStorage.setItem('session', JSON.stringify(session));
        }
    },

    removeSession() {
        localStorage.removeItem('session');
    }
};

export default tokenProvider;
