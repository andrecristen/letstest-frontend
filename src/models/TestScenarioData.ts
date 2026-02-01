import { TestCaseData } from "./TestCaseData";

export type TestScenarioData = {
    id?: number;
    name: string;
    data?: Object;
    templateId?: number;
    projectId?: number;
    approvalStatus?: number;
    reviewedAt?: string | null;
    reviewedById?: number | null;
    approvedAt?: string | null;
    approvedById?: number | null;
    hasExecutions?: boolean;
    testCases?: TestCaseData[];
};
