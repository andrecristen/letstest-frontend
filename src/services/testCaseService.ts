import { TestCaseData } from "../types/TestCaseData";
import apiTokenService from "./apiTokenService";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenService.get('/test-case/project/' + projectId);
};

export const getMyByProjects = async (projectId: number) => {
    return await apiTokenService.get('/test-case/project/' + projectId);
};

export const getById = async (testCaseId: number) => {
    return await apiTokenService.get('/test-case/' + testCaseId);
};

export const create = async (projectId: number, data: TestCaseData) => {
    return await apiTokenService.post('/test-case/' + projectId, data);
}

export const update = async (testCaseId: number, data: TestCaseData) => {
    return await apiTokenService.put('/test-case/' + testCaseId, data);
}