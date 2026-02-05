import { ProjectData } from "./ProjectData";
import { UserData } from "./UserData";

export type InvolvementData = {
    id: number;
    type: number;
    userId: number;
    projectId: number;
    user?: UserData;
    project?: ProjectData;
}

export enum InvolvementTypeEnum {
    Tester = 1,
    Manager = 2,
}

const involvementTypeLabels: Record<InvolvementTypeEnum, string> = {
    [InvolvementTypeEnum.Tester]: "enums.involvement.type.tester",
    [InvolvementTypeEnum.Manager]: "enums.involvement.type.manager",
};

export const getInvolvementTypeDescription = (value: number): string | undefined => {
    const labelKey = involvementTypeLabels[value as InvolvementTypeEnum];
    return labelKey ? labelKey : undefined;
}
