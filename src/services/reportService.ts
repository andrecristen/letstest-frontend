import { ReportData } from "../models/ReportData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const createReport = async (testExecutionId: number, body: ReportData) => {
    return await apiTokenProvider.post('/report/' + testExecutionId, body);
};

export const getReportsByTestExecution = async (testExecutionId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/report/test-execution/' + testExecutionId, { params: { page, limit } });
};
