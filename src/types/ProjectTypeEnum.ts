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