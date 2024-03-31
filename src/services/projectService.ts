import apiTokenService from "./apiTokenService";

export const getMyProjects = async () => {
    return await apiTokenService.get('/projects/me');
};