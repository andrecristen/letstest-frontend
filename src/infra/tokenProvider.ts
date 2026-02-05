export type Organization = {
    id: number;
    name: string;
    slug: string;
    plan: string;
    role: string;
};

export type Session = {
    token: string;
    userId: number;
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
        userId: number,
        organizationId?: number,
        organizationSlug?: string,
        organizationRole?: string,
        organizations?: Organization[]
    ) {
        localStorage.setItem('session', JSON.stringify({
            token,
            userId,
            organizationId,
            organizationSlug,
            organizationRole,
            organizations,
        }));
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
