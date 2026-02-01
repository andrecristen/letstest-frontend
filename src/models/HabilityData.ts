import i18n from "../i18n";

export type HabilityData = {
    id?: number;
    type: HabilityType;
    value: string;
    userId?: number;
}

export enum HabilityType {
    Experience = 1,
    Certification = 2,
    Course = 3,
    Language = 4,
    SoftSkill = 5,
}

const habilityTypeOrder: HabilityType[] = [
    HabilityType.Experience,
    HabilityType.Certification,
    HabilityType.Course,
    HabilityType.Language,
    HabilityType.SoftSkill,
];

const habilityTypeLabels: Record<HabilityType, string> = {
    [HabilityType.Experience]: "enums.hability.type.experience",
    [HabilityType.Certification]: "enums.hability.type.certification",
    [HabilityType.Course]: "enums.hability.type.course",
    [HabilityType.Language]: "enums.hability.type.language",
    [HabilityType.SoftSkill]: "enums.hability.type.softSkill",
};

export const getHabilityTypeList = () => {
    return habilityTypeOrder.map((type) => ({
        name: i18n.t(habilityTypeLabels[type]),
        id: type,
    }));
}

export const getHabilityTypeDescription = (value: number): string | undefined => {
    const labelKey = habilityTypeLabels[value as HabilityType];
    return labelKey ? i18n.t(labelKey) : undefined;
}
