import { ProjectData } from "../models/ProjectData";
import { ProjectSituationEnum } from "../models/ProjectData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getMyProjects = async () => {
    return await apiTokenProvider.get('/projects/me');
};

export const getTestProjects = async () => {
    return await apiTokenProvider.get('/projects/test');
};

export const getPublicProjects = async () => {
    return await apiTokenProvider.get('/projects/public');
};

export const createProject = async (body: ProjectData) => {
    body.situation = ProjectSituationEnum.Teste;
    return await apiTokenProvider.post('/projects', body);
};

export const getProjectById = async (id: number) => {
    return await apiTokenProvider.get("/projects/" + id);
}

export const getOverviewProject = async (id: number) => {
    return await apiTokenProvider.get("/projects/" + id + "/overview");
}

export const updateProject = async (body: ProjectData) => {
    if (!body.id) {
        throw Error("Necessário 'id'");
    }
    return await apiTokenProvider.put("/projects/" + body.id, body);
}