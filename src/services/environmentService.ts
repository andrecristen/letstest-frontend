import { EnvironmentData } from "../types/EnvironmentData";
import apiTokenService from "./apiTokenService";

export const getAllByProjects = async (projectId: number) => {
    return await apiTokenService.get('/environment/project/' + projectId);
};

export const createEnvironment = async (projectId: number, body: EnvironmentData) => {
    return await apiTokenService.post('/environment/' + projectId, body);
};

export const updateEnvironment = async (body: EnvironmentData) => {
    if (!body.id) {
        throw Error("Necessário 'id'");
    }
    return await apiTokenService.put("/environment/" + body.id, body);
}