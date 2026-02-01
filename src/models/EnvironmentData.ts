import i18n from "../i18n";

export type EnvironmentData = {
    id: number;
    name: string;
    description: string;
    situation: number;
}

export enum EnvironmentSituation {
    Operational = 1,
    Inoperative = 2,
}

const environmentSituationOrder: EnvironmentSituation[] = [
    EnvironmentSituation.Operational,
    EnvironmentSituation.Inoperative,
];

const environmentSituationLabels: Record<EnvironmentSituation, string> = {
    [EnvironmentSituation.Operational]: "enums.environment.situation.operational",
    [EnvironmentSituation.Inoperative]: "enums.environment.situation.inoperative",
};

export const getEnvironmentSituationList = () => {
    return environmentSituationOrder.map((situation) => ({
        name: i18n.t(environmentSituationLabels[situation]),
        id: situation,
    }));
}

export const getEnvironmentSituationDescription = (value: number): string | undefined => {
    const labelKey = environmentSituationLabels[value as EnvironmentSituation];
    return labelKey ? i18n.t(labelKey) : undefined;
}
