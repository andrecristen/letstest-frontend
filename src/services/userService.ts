import { UserData } from "../models/UserData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import tokenProvider from "../infra/tokenProvider";

export const getMe = async () => {
    return await getById(tokenProvider.getSessionUserId());
};

export const getById = async (userId: number) => {
    return await apiTokenProvider.get('/users/' + userId);
};

export const update = async (userId: number, data: UserData) => {
    return await apiTokenProvider.put('/users/' + userId, data);
}

export type UserSearchFilters = {
    search?: string;
    hability?: string;
    habilityType?: number | null;
    deviceType?: number | null;
    deviceBrand?: string;
    deviceModel?: string;
    deviceSystem?: string;
    excludeProjectId?: number;
    excludeInvolvementType?: number;
};

export const searchUsers = async (filters: UserSearchFilters, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/users/search', {
        params: {
            ...filters,
            page,
            limit,
        },
    });
};
