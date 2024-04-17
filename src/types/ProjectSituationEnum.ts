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