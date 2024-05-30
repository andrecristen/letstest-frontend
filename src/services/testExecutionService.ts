import { TestExecutionData } from "../models/TestExecutionData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getByTestCase = async (testCaseId: number) => {
    return await apiTokenProvider.get('/test-execution/test-case/' + testCaseId);
};

export const getMyByTestCase = async (testCaseId: number) => {
    return await apiTokenProvider.get('/test-execution/test-case/' + testCaseId + '/my');
};

export const getById = async (TestExecutionId: number) => {
    return await apiTokenProvider.get('/test-execution/' + TestExecutionId);
};

export const create = async (testCaseId: number, data: TestExecutionData) => {
    return await apiTokenProvider.post('/test-execution/' + testCaseId, data);
}