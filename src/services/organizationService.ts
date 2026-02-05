import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export type OrganizationData = {
    id?: number;
    name: string;
    slug?: string;
    plan?: string;
    logo?: string;
};

export type OrganizationMember = {
    id: number;
    userId: number;
    role: string;
    joinedAt: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
};

export type PendingInvite = {
    id: number;
    email: string;
    role: string;
    createdAt: string;
    expiresAt: string;
};

export type MembersResponse = {
    members: OrganizationMember[];
    pendingInvites: PendingInvite[];
};

export type MyInvite = {
    id: number;
    email: string;
    role: string;
    token: string;
    createdAt: string;
    expiresAt: string;
    organization: {
        id: number;
        name: string;
        slug: string;
        logo?: string;
    };
};

export type OrganizationInvite = {
    email: string;
    role: string;
};

export const getMyOrganizations = async () => {
    return await apiTokenProvider.get('/organizations');
};

export const create = async (name: string) => {
    return await apiTokenProvider.post('/organizations', { name });
};

export const getById = async (orgId: number) => {
    return await apiTokenProvider.get(`/organizations/${orgId}`);
};

export const update = async (orgId: number, data: Partial<OrganizationData>) => {
    return await apiTokenProvider.put(`/organizations/${orgId}`, data);
};

export const getMembers = async (orgId: number) => {
    return await apiTokenProvider.get(`/organizations/${orgId}/members`);
};

export const inviteMember = async (orgId: number, invite: OrganizationInvite) => {
    return await apiTokenProvider.post(`/organizations/${orgId}/members/invite`, invite);
};

export const cancelInvite = async (orgId: number, inviteId: number) => {
    return await apiTokenProvider.delete(`/organizations/${orgId}/invites/${inviteId}`);
};

export const resendInvite = async (orgId: number, inviteId: number) => {
    return await apiTokenProvider.post(`/organizations/${orgId}/invites/${inviteId}/resend`, {});
};

export const updateMemberRole = async (orgId: number, userId: number, role: string) => {
    return await apiTokenProvider.put(`/organizations/${orgId}/members/${userId}/role`, { role });
};

export const removeMember = async (orgId: number, userId: number) => {
    return await apiTokenProvider.delete(`/organizations/${orgId}/members/${userId}`);
};

export const getMyInvites = async () => {
    return await apiTokenProvider.get('/organizations/my-invites');
};

export const acceptInvite = async (token: string) => {
    return await apiTokenProvider.post('/organizations/invite/accept', { token });
};

export const switchOrganization = async (organizationId: number) => {
    return await apiTokenProvider.post('/users/auth/switch-org', { organizationId });
};
