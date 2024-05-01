export type ProjectData = {
    id?: number;
    name: string;
    description: string;
    visibility: number;
    situation: number;
    creatorId?: number;
}

export enum ProjectVisibilityEnum {
    Público = 1,
    Privado = 2,
}

export const getProjectVisibilityList = () => {
    return Object.keys(ProjectVisibilityEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ProjectVisibilityEnum[key as keyof typeof ProjectVisibilityEnum]}));
}

export const getProjectVisibilityDescription = (value: number): string | undefined => {
    const description = Object.keys(ProjectVisibilityEnum)
        .find(key => ProjectVisibilityEnum[key as keyof typeof ProjectVisibilityEnum] === value);
    return description ? description : undefined;
}

export enum ProjectSituationEnum {
    Teste = 1,
    Finalizado = 2,
    Cancelado = 3,
}

export enum ProjectSituationColorEnum {
    "blue-500" = 1,
    "green-700" = 2,
    "red-500" = 3,
}

export const getProjectSituationList = () => {
    return Object.keys(ProjectSituationEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ProjectSituationEnum[key as keyof typeof ProjectSituationEnum] ? ProjectSituationEnum[key as keyof typeof ProjectSituationEnum] : null }));
}

export const getProjectSituationDescription = (value: number): string | undefined => {
    const description = Object.keys(ProjectSituationEnum)
        .find(key => ProjectSituationEnum[key as keyof typeof ProjectSituationEnum] === value);
    return description ? description : undefined;
}

export const getProjectSituationColor= (value: number): string | undefined => {
    const description = Object.keys(ProjectSituationColorEnum)
        .find(key => ProjectSituationColorEnum[key as keyof typeof ProjectSituationColorEnum] === value);
    return description ? description : undefined;
}

export enum ProjectTypeEnum {
    Web = 1,
    Desktop = 2,
    App = 3,
    Híbrido = 4,
}

export const getProjectTypeList = () => {
    return Object.keys(ProjectTypeEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ProjectTypeEnum[key as keyof typeof ProjectTypeEnum]}));
}