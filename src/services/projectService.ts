import { ProjectData } from "../types/ProjectData";
import { ProjectSituationEnum } from "../types/ProjectSituationEnum";
import apiTokenService from "./apiTokenService";

export const getMyProjects = async () => {
    return await apiTokenService.get('/projects/me');
};

export const getPublicProjects = async () => {
    return await apiTokenService.get('/projects/public');
};

export const createProject = async (body: ProjectData) => {
    body.situation = ProjectSituationEnum.Teste;
    return await apiTokenService.post('/projects', body);
};

export const getProjectById = async (id: number) => {
    return await apiTokenService.get("/projects/" + id);
}

export const updateProject = async (body: ProjectData) => {
    if (!body.id) {
        throw Error("Necessário 'id'");
    }
    return await apiTokenService.put("/projects/" + body.id, body);
}