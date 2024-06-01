import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import { TestScenarioData } from "../models/TestScenarioData";

export const getAllTestScenariosByProjects = async (projectId: number) => {
    return await apiTokenProvider.get('/test-scenario/project/' + projectId);
};

export const getMyTestScenariosByProjects = async (projectId: number) => {
    return await apiTokenProvider.get('/test-scenario/project/' + projectId);
};

export const getTestScenarioById = async (testScenarioId: number) => {
    return await apiTokenProvider.get('/test-scenario/' + testScenarioId);
};

export const createTestScenario = async (projectId: number, data: TestScenarioData) => {
    return await apiTokenProvider.post('/test-scenario/' + projectId, data);
}

export const updateTestScenario = async (testScenarioId: number, data: TestScenarioData) => {
    return await apiTokenProvider.put('/test-scenario/' + testScenarioId, data);
}