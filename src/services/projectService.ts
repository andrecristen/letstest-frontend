import { ProjectData } from "../models/ProjectData";
import { ProjectSituationEnum } from "../models/ProjectData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import i18n from "../i18n";

export const getMyProjects = async (
    page = 1,
    limit = 20,
    filters?: { search?: string; situation?: number | null; visibility?: number | null }
) => {
    return await apiTokenProvider.get('/projects/me', {
        params: { page, limit, ...filters },
    });
};

export const getTestProjects = async (page = 1, limit = 20) => {
    return await apiTokenProvider.get('/projects/test', { params: { page, limit } });
};

export const getPublicProjects = async (page = 1, limit = 20) => {
    return await apiTokenProvider.get('/projects/public', { params: { page, limit } });
};

export const createProject = async (body: ProjectData) => {
    body.situation = ProjectSituationEnum.Testing;
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
        throw Error(i18n.t("common.idRequired"));
    }
    return await apiTokenProvider.put("/projects/" + body.id, body);
}
