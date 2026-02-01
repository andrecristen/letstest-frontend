import { TemplateData } from "../models/TemplateData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getAllByProject = async (projectId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/template/' + projectId + '/all', { params: { page, limit } });
};

export const getAllByProjectAndType = async (projectId: number, type: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/template/' + projectId + '/' + type, { params: { page, limit } });
};

export const getById = async (templateId: number) => {
    return await apiTokenProvider.get('/template/' + templateId);
};

export const create = async (projectId: number, data: TemplateData) => {
    return await apiTokenProvider.post('/template/' + projectId, data);
}
