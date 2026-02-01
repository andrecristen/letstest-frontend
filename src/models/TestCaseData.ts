import { EnvironmentData } from "./EnvironmentData";
import { TestExecutionData } from "./TestExecutionData";
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
    dueDate?: string | null;
    approvalStatus?: number;
    reviewedAt?: string | null;
    reviewedById?: number | null;
    approvedAt?: string | null;
    approvedById?: number | null;
    testExecutions?: TestExecutionData[];
    assignments?: {
        id: number;
        userId: number;
        startedAt?: string | null;
        lastPausedAt?: string | null;
        totalPausedSeconds?: number;
        finishedAt?: string | null;
        user?: { id: number; name: string; email: string };
    }[];
};
