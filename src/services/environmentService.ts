import { EnvironmentData } from "../models/EnvironmentData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenProvider.get('/environment/project/' + projectId);
};

export const createEnvironment = async (projectId: number, body: EnvironmentData) => {
    return await apiTokenProvider.post('/environment/' + projectId, body);
};

export const updateEnvironment = async (body: EnvironmentData) => {
    if (!body.id) {
        throw Error("Necessário 'id'");
    }
    return await apiTokenProvider.put("/environment/" + body.id, body);
}