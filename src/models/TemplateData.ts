import i18n from "../i18n";

export type TemplateData = {
    id: number;
    name: string;
    description: string;
    data: Object;
    type: number;
    projectId?: number;
}


export enum TemplateTypeEnum {
    TestScenarioDefinition = 3,
    TestCaseDefinition = 1,
    TestCaseExecution = 2,
}

const templateTypeOrder: TemplateTypeEnum[] = [
    TemplateTypeEnum.TestScenarioDefinition,
    TemplateTypeEnum.TestCaseDefinition,
    TemplateTypeEnum.TestCaseExecution,
];

const templateTypeLabels: Record<TemplateTypeEnum, string> = {
    [TemplateTypeEnum.TestScenarioDefinition]: "enums.template.type.testScenarioDefinition",
    [TemplateTypeEnum.TestCaseDefinition]: "enums.template.type.testCaseDefinition",
    [TemplateTypeEnum.TestCaseExecution]: "enums.template.type.testCaseExecution",
};

export const getTemplateTypeDescription = (value: number): string | undefined => {
    const labelKey = templateTypeLabels[value as TemplateTypeEnum];
    return labelKey ? i18n.t(labelKey) : undefined;
}

export const getTemplateTypeList = () => {
    return templateTypeOrder.map((type) => ({
        name: i18n.t(templateTypeLabels[type]),
        id: type,
    }));
}
