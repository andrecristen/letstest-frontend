import { ReportData } from "../types/ReportData";
import apiTokenService from "./apiTokenService";

export const createReport = async (testExecutionId: number, body: ReportData) => {
    return await apiTokenService.post('/report/' + testExecutionId, body);
};