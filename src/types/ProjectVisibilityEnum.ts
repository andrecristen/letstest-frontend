export enum ProjectVisibilityEnum {
    Público = 1,
    Privado = 2,
}

export const getProjectVisibilityList = () => {
    return Object.keys(ProjectVisibilityEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ProjectVisibilityEnum[key as keyof typeof ProjectVisibilityEnum]}));
}