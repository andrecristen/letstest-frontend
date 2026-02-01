import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import { TagData } from "../models/TagData";

export const getTagsByProject = async (projectId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/tag/project/' + projectId, { params: { page, limit } });
};

export const getTagById = async (tagId: number) => {
    return await apiTokenProvider.get('/tag/' + tagId);
};

export const createTag = async (projectId: number, body: TagData) => {
    return await apiTokenProvider.post('/tag/' + projectId, body);
};

export const updateTag = async (tagId: number, body: TagData) => {
    return await apiTokenProvider.put('/tag/' + tagId, body);
};
