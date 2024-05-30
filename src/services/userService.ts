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