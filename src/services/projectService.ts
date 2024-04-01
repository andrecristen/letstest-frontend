import { ProjectData } from "../types/ProjectData";
import { ProjectSituationEnum } from "../types/ProjectSituationEnum";
import apiTokenService from "./apiTokenService";

export const getMyProjects = async () => {
    return await apiTokenService.get('/projects/me');
};

export const createProject = async (body: ProjectData) => {
    body.situation = ProjectSituationEnum.Testando;
    return await apiTokenService.post('/projects', body);
};