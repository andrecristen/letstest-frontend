import i18n from "../i18n";
import { TestScenarioData } from "./TestScenarioData";
import { UserData } from "./UserData";

export type ProjectData = {
    id?: number;
    name: string;
    description: string;
    visibility: number;
    situation: number;
    creatorId?: number;
    creator?: UserData;
    testScenarios?: TestScenarioData[];
}

export enum ProjectVisibilityEnum {
    Public = 1,
    Private = 2,
}

const projectVisibilityOrder: ProjectVisibilityEnum[] = [
    ProjectVisibilityEnum.Public,
    ProjectVisibilityEnum.Private,
];

const projectVisibilityLabels: Record<ProjectVisibilityEnum, string> = {
    [ProjectVisibilityEnum.Public]: "enums.project.visibility.public",
    [ProjectVisibilityEnum.Private]: "enums.project.visibility.private",
};

export const getProjectVisibilityList = () => {
    return projectVisibilityOrder.map((visibility) => ({
        name: i18n.t(projectVisibilityLabels[visibility]),
        id: visibility,
    }));
}

export const getProjectVisibilityDescription = (value: number): string | undefined => {
    const labelKey = projectVisibilityLabels[value as ProjectVisibilityEnum];
    return labelKey ? i18n.t(labelKey) : undefined;
}

export enum ProjectSituationEnum {
    Testing = 1,
    Finished = 2,
    Canceled = 3,
}

export enum ProjectSituationColorEnum {
    "blue-500" = 1,
    "green-700" = 2,
    "red-500" = 3,
}

const projectSituationOrder: ProjectSituationEnum[] = [
    ProjectSituationEnum.Testing,
    ProjectSituationEnum.Finished,
    ProjectSituationEnum.Canceled,
];

const projectSituationLabels: Record<ProjectSituationEnum, string> = {
    [ProjectSituationEnum.Testing]: "enums.project.situation.testing",
    [ProjectSituationEnum.Finished]: "enums.project.situation.finished",
    [ProjectSituationEnum.Canceled]: "enums.project.situation.canceled",
};

export const getProjectSituationList = () => {
    return projectSituationOrder.map((situation) => ({
        name: i18n.t(projectSituationLabels[situation]),
        id: situation,
    }));
}

export const getProjectSituationDescription = (value: number): string | undefined => {
    const labelKey = projectSituationLabels[value as ProjectSituationEnum];
    return labelKey ? i18n.t(labelKey) : undefined;
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
    Hybrid = 4,
}

const projectTypeOrder: ProjectTypeEnum[] = [
    ProjectTypeEnum.Web,
    ProjectTypeEnum.Desktop,
    ProjectTypeEnum.App,
    ProjectTypeEnum.Hybrid,
];

const projectTypeLabels: Record<ProjectTypeEnum, string> = {
    [ProjectTypeEnum.Web]: "enums.project.type.web",
    [ProjectTypeEnum.Desktop]: "enums.project.type.desktop",
    [ProjectTypeEnum.App]: "enums.project.type.app",
    [ProjectTypeEnum.Hybrid]: "enums.project.type.hybrid",
};

export const getProjectTypeList = () => {
    return projectTypeOrder.map((type) => ({
        name: i18n.t(projectTypeLabels[type]),
        id: type,
    }));
}
