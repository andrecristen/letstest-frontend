import { DeviceData } from "../types/DeviceData";
import apiTokenService from "./apiTokenService";
import tokenService from "./tokenService";

export const getMy = async () => {
    return await getByUserId(tokenService.getSessionUserId());
};

export const getByUserId = async (userId: number) => {
    return await apiTokenService.get('/device/' + userId);
};

export const create = async (data: DeviceData) => {
    return await apiTokenService.post('/device/' + tokenService.getSessionUserId(), data);
}

export const remove = async (id: number) => {
    return await apiTokenService.delete('/device/' + id);
}