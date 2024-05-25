import apiTokenService from "./apiTokenService";
import tokenService from "./tokenService";

export const getMe = async () => {
    return await getById(tokenService.getSessionUserId());
};

export const getById = async (userId: number) => {
    return await apiTokenService.get('/users/' + userId);
};