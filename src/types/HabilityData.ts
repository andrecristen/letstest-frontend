export interface HabilityData {
    id?: number;
    type: HabilityType;
    value: string;
    userId?: number;
}

export enum HabilityType {
    Experiência = 1,
    Certificação = 2,
    Curso = 3,
    Linguagem = 4,
    SoftSkill = 5,
}

export const getHabilityTypeList = () => {
    return Object.keys(HabilityType)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: HabilityType[key as keyof typeof HabilityType] }));
}

export const getHabilityTypeDescription = (value: number): string | undefined => {
    const description = Object.keys(HabilityType)
        .find(key => HabilityType[key as keyof typeof HabilityType] === value);
    return description ? description : undefined;
}
