import i18n from "../i18n";
import { ProjectData } from "./ProjectData";
import { UserData } from "./UserData";

export type InvolvementData = {
    id: number;
    situation: number;
    type: number;
    userId: number;
    projectId: number;
    user?: UserData;
    project?: ProjectData;
}

export enum InvolvementSituationEnum {
    Accepted = 4,
    Sent = 2,
    Received = 1,
    Rejected = 3,
}

const involvementSituationOrder: InvolvementSituationEnum[] = [
    InvolvementSituationEnum.Received,
    InvolvementSituationEnum.Sent,
    InvolvementSituationEnum.Rejected,
    InvolvementSituationEnum.Accepted,
];

const involvementSituationLabels: Record<InvolvementSituationEnum, string> = {
    [InvolvementSituationEnum.Received]: "enums.involvement.situation.received",
    [InvolvementSituationEnum.Sent]: "enums.involvement.situation.sent",
    [InvolvementSituationEnum.Rejected]: "enums.involvement.situation.rejected",
    [InvolvementSituationEnum.Accepted]: "enums.involvement.situation.accepted",
};

export const getInvolvementSituationList = () => {
    return involvementSituationOrder.map((situation) => ({
        name: i18n.t(involvementSituationLabels[situation]),
        id: situation,
    }));
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
    return labelKey ? i18n.t(labelKey) : undefined;
}
