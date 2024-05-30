import { UserData } from "./UserData";

export type TestExecutionData = {
    id?: number;
    data: Object;
    testTime: number;
    testCaseId?: number;
    userId?: number;
    user?: UserData;
};