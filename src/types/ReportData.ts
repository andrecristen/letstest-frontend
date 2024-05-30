export type ReportData = {
    id?: number;
    type: number;
    score: number;
    commentary: string;
    testExecutionId?: number;
    userId?: number;
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