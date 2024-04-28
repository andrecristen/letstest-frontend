import { TemplateData } from "../types/TemplateData";
import apiTokenService from "./apiTokenService";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenService.get('/template/' + projectId + '/all');
};

export const getById = async (templateId: number) => {
    return await apiTokenService.get('/template/' + templateId);
};

export const create = async (projectId: number, data: TemplateData) => {
    return await apiTokenService.post('/template/' + projectId, data);
}