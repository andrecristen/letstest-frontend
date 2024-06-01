import { TestCaseData } from "./TestCaseData";

export type TestScenarioData = {
    id?: number;
    name: string;
    data?: Object;
    templateId?: number;
    projectId?: number;
    testCases?: TestCaseData[];
};