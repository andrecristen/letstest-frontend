export enum ProjectSituationEnum {
    Testando = 1,
    Finalizado = 2,
    Cancelado = 3,
}

export const getProjectSituationList = () => {
    return Object.keys(ProjectSituationEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ProjectSituationEnum[key as keyof typeof ProjectSituationEnum] ? ProjectSituationEnum[key as keyof typeof ProjectSituationEnum] : null }));
}
