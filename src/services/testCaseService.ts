import { TestCaseData } from "../models/TestCaseData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenProvider.get('/test-case/project/' + projectId);
};

export const getMyByProjects = async (projectId: number) => {
    return await apiTokenProvider.get('/test-case/project/' + projectId);
};

export const getById = async (testCaseId: number) => {
    return await apiTokenProvider.get('/test-case/' + testCaseId);
};

export const create = async (projectId: number, data: TestCaseData) => {
    return await apiTokenProvider.post('/test-case/' + projectId, data);
}

export const update = async (testCaseId: number, data: TestCaseData) => {
    return await apiTokenProvider.put('/test-case/' + testCaseId, data);
}