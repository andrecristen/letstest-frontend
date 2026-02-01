import { EnvironmentData } from "../models/EnvironmentData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";
import i18n from "../i18n";

export const getAllByProjects = async (projectId: number, page = 1, limit = 20) => {
    return await apiTokenProvider.get('/environment/project/' + projectId, { params: { page, limit } });
};

export const createEnvironment = async (projectId: number, body: EnvironmentData) => {
    return await apiTokenProvider.post('/environment/' + projectId, body);
};

export const updateEnvironment = async (body: EnvironmentData) => {
    if (!body.id) {
        throw Error(i18n.t("common.idRequired"));
    }
    return await apiTokenProvider.put("/environment/" + body.id, body);
}
