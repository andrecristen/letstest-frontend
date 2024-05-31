import { DeviceData } from "./DeviceData";
import { UserData } from "./UserData";

export type TestExecutionData = {
    id?: number;
    data: Object;
    testTime: number;
    testCaseId?: number;
    templateId?: number;
    userId?: number;
    deviceId?: number;
    user?: UserData;
    device?: DeviceData;
};