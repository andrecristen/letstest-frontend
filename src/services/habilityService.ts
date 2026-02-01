import { HabilityData } from "../models/HabilityData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import tokenProvider from "../infra/tokenProvider";

export const getMy = async (page = 1, limit = 20) => {
    return await getHabilitiesByUserId(tokenProvider.getSessionUserId(), page, limit);
};

export const getHabilitiesByUserId = async (userId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/hability/' + userId, { params: { page, limit } });
};

export const create = async (data: HabilityData) => {
    return await apiTokenProvider.post('/hability/' + tokenProvider.getSessionUserId(), data);
}

export const remove = async (id: number) => {
    return await apiTokenProvider.delete('/hability/' + id);
}
