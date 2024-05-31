import { EnvironmentData } from "./EnvironmentData";

export type TestCaseData = {
    id?: number;
    name: string;
    data: Object;
    templateId?: number;
    deviceId?: number;
    projectId: number;
    environmentId?: number;
    environment?: EnvironmentData
};