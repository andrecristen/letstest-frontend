import { InvolvementTypeEnum } from "../models/InvolvementData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getByProject = async (
    projectId: number,
    page = 1,
    limit = 20,
    filters?: { search?: string; type?: InvolvementTypeEnum }
) => {
    return await apiTokenProvider.get('/involvement/project/' + projectId, {
        params: { page, limit, ...filters },
    });
};

export const addMember = async (projectId: number, userId: number, type: InvolvementTypeEnum) => {
    return await apiTokenProvider.post('/involvement/project/' + projectId, {
        userId,
        type,
    });
};

export const remove = async (involvementId: number) => {
    return await apiTokenProvider.delete('/involvement/' + involvementId);
};

export const getProjectTesters = async (projectId: number) => {
    return await apiTokenProvider.get('/involvement/project/' + projectId + '/testers');
};

export type ProjectRole = {
    isOwner: boolean;
    isManager: boolean;
    isTester: boolean;
    canManageTests: boolean;
};

export const getMyProjectRole = async (projectId: number): Promise<ProjectRole | null> => {
    try {
        const response = await apiTokenProvider.get('/involvement/project/' + projectId + '/my-role');
        return response?.data ?? null;
    } catch {
        return null;
    }
};
