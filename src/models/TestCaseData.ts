import { EnvironmentData } from "./EnvironmentData";
import { TestScenarioData } from "./TestScenarioData";

export type TestCaseData = {
    id?: number;
    name: string;
    data: Object;
    templateId?: number;
    deviceId?: number;
    projectId: number;
    environmentId?: number;
    environment?: EnvironmentData
    testScenarioId?: number;
    testScenario?: TestScenarioData;
};