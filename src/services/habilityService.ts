import { HabilityData } from "../models/HabilityData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import tokenProvider from "../infra/tokenProvider";

export const getMy = async () => {
    return await getHabilitiesByUserId(tokenProvider.getSessionUserId());
};

export const getHabilitiesByUserId = async (userId: number) => {
    return await apiTokenProvider.get('/hability/' + userId);
};

export const create = async (data: HabilityData) => {
    return await apiTokenProvider.post('/hability/' + tokenProvider.getSessionUserId(), data);
}

export const remove = async (id: number) => {
    return await apiTokenProvider.delete('/hability/' + id);
}