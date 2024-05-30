import { TemplateData } from "../models/TemplateData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getAllByProject = async (projectId: number) => {
    return await apiTokenProvider.get('/template/' + projectId + '/all');
};

export const getAllByProjectAndType = async (projectId: number, type: number) => {
    return await apiTokenProvider.get('/template/' + projectId + '/' + type);
};

export const getById = async (templateId: number) => {
    return await apiTokenProvider.get('/template/' + templateId);
};

export const create = async (projectId: number, data: TemplateData) => {
    return await apiTokenProvider.post('/template/' + projectId, data);
}