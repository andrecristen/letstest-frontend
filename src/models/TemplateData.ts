export type TemplateData = {
    id: number;
    name: string;
    description: string;
    data: Object;
    type: number;
    projectId?: number;
}


export enum TemplateTypeEnum {
    "Definição de cenários de teste" = 3,
    "Definição de casos de teste" = 1,
    "Execução de casos de teste" = 2,
}

export const getTemplateTypeDescription = (value: number): string | undefined => {
    const description = Object.keys(TemplateTypeEnum)
        .find(key => TemplateTypeEnum[key as keyof typeof TemplateTypeEnum] === value);
    return description ? description : undefined;
}

export const getTemplateTypeList = () => {
    return Object.keys(TemplateTypeEnum)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: TemplateTypeEnum[key as keyof typeof TemplateTypeEnum] }));
}