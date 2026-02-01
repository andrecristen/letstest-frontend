import i18n from "../i18n";
import { UserData } from "./UserData";

export type ReportData = {
    id?: number;
    type: number;
    score: number;
    commentary: string;
    testExecutionId?: number;
    userId?: number;
    user?: UserData
}

export enum ReportType {
    Approved = 1,
    Rejected = 2,
}

const reportTypeOrder: ReportType[] = [
    ReportType.Approved,
    ReportType.Rejected,
];

const reportTypeLabels: Record<ReportType, string> = {
    [ReportType.Approved]: "enums.report.type.approved",
    [ReportType.Rejected]: "enums.report.type.rejected",
};

export const getReportTypeList = () => {
    return reportTypeOrder.map((type) => ({
        name: i18n.t(reportTypeLabels[type]),
        id: type,
    }));
}

export const getReportTypeDescription = (value: number): string | undefined => {
    const labelKey = reportTypeLabels[value as ReportType];
    return labelKey ? i18n.t(labelKey) : undefined;
}
