import { DeviceData } from "../models/DeviceData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import tokenProvider from "../infra/tokenProvider";

export const getMy = async (page = 1, limit = 20) => {
    return await getDevicesByUserId(tokenProvider.getSessionUserId(), page, limit);
};

export const getDevicesByUserId = async (userId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/device/' + userId, { params: { page, limit } });
};

export const create = async (data: DeviceData) => {
    return await apiTokenProvider.post('/device/' + tokenProvider.getSessionUserId(), data);
}

export const remove = async (id: number) => {
    return await apiTokenProvider.delete('/device/' + id);
}
