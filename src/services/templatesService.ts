import { TemplateData } from "../types/TemplateData";
import apiTokenService from "./apiTokenService";

export const getAllByProject = async (projectId: number) => {
    return await apiTokenService.get('/template/' + projectId + '/all');
};

export const getAllByProjectAndType = async (projectId: number, type: number) => {
    return await apiTokenService.get('/template/' + projectId + '/' + type);
};

export const getById = async (templateId: number) => {
    return await apiTokenService.get('/template/' + templateId);
};

export const create = async (projectId: number, data: TemplateData) => {
    return await apiTokenService.post('/template/' + projectId, data);
}