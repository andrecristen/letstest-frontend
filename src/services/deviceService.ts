import { DeviceData } from "../models/DeviceData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import tokenProvider from "../infra/tokenProvider";

export const getMy = async () => {
    return await getDevicesByUserId(tokenProvider.getSessionUserId());
};

export const getDevicesByUserId = async (userId: number) => {
    return await apiTokenProvider.get('/device/' + userId);
};

export const create = async (data: DeviceData) => {
    return await apiTokenProvider.post('/device/' + tokenProvider.getSessionUserId(), data);
}

export const remove = async (id: number) => {
    return await apiTokenProvider.delete('/device/' + id);
}