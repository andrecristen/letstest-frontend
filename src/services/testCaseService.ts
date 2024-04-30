import { TemplateData } from "../types/TemplateData";
import apiTokenService from "./apiTokenService";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenService.get('/test-case/project/' + projectId);
};

export const getById = async (templateId: number) => {
    return await apiTokenService.get('/test-case/' + templateId);
};

export const create = async (projectId: number, data: TemplateData) => {
    return await apiTokenService.post('/test-case/' + projectId, data);
}