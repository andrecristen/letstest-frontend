import { DeviceData } from "./DeviceData";
import { ReportData } from "./ReportData";
import { UserData } from "./UserData";

export type TestExecutionData = {
    id?: number;
    data: Object;
    reported?: string;
    testTime: number;
    testCaseId?: number;
    templateId?: number;
    userId?: number;
    deviceId?: number;
    user?: UserData;
    device?: DeviceData;
    reports?: ReportData[];
};
