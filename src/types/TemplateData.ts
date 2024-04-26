export type TemplateData = {
    id: number;
    name: string;
    description: string;
    data: Object;
    type: number;
    projectId?: number;
}


export enum TemplateTypeEnum {
    Definição = 1,
    Execução = 2,
}

export const getTemplateTypeDescription = (value: number): string | undefined => {
    const description = Object.keys(TemplateTypeEnum)
        .find(key => TemplateTypeEnum[key as keyof typeof TemplateTypeEnum] === value);
    return description ? description : undefined;
}