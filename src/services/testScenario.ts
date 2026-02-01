import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import { TestScenarioData } from "../models/TestScenarioData";

export const getAllTestScenariosByProjects = async (projectId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/test-scenario/project/' + projectId, { params: { page, limit } });
};

export const getMyTestScenariosByProjects = async (projectId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/test-scenario/project/' + projectId, { params: { page, limit } });
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

export const updateTestScenarioStatus = async (testScenarioId: number, status: number) => {
    return await apiTokenProvider.put('/test-scenario/' + testScenarioId + '/status', { status });
}
