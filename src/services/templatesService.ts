import apiTokenService from "./apiTokenService";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenService.get('/template/' + projectId + '/all');
};