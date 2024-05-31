import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getTagsByProject = async (projectId: number) => {
    return await apiTokenProvider.get('/tag/project/' + projectId);
};
