import { HabilityData } from "../types/HabilityData";
import apiTokenService from "./apiTokenService";
import tokenService from "./tokenService";

export const getMy = async () => {
    return await getHabilitiesByUserId(tokenService.getSessionUserId());
};

export const getHabilitiesByUserId = async (userId: number) => {
    return await apiTokenService.get('/hability/' + userId);
};

export const create = async (data: HabilityData) => {
    return await apiTokenService.post('/hability/' + tokenService.getSessionUserId(), data);
}

export const remove = async (id: number) => {
    return await apiTokenService.delete('/hability/' + id);
}