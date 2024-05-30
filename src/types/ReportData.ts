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
    Aprovado = 1,
    Rejeitado = 2,
}

export const getReportTypeList = () => {
    return Object.keys(ReportType)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ReportType[key as keyof typeof ReportType] }));
}

export const getReportTypeDescription = (value: number): string | undefined => {
    const description = Object.keys(ReportType)
        .find(key => ReportType[key as keyof typeof ReportType] === value);
    return description ? description : undefined;
}