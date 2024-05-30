import { TestExecutionData } from "../types/TestExecutionData";
import apiTokenService from "./apiTokenService";

export const getByTestCase = async (testCaseId: number) => {
    return await apiTokenService.get('/test-execution/test-case/' + testCaseId);
};

export const getMyByTestCase = async (testCaseId: number) => {
    return await apiTokenService.get('/test-execution/test-case/' + testCaseId + '/my');
};

export const getById = async (TestExecutionId: number) => {
    return await apiTokenService.get('/test-execution/' + TestExecutionId);
};

export const create = async (testCaseId: number, data: TestExecutionData) => {
    return await apiTokenService.post('/test-execution/' + testCaseId, data);
}