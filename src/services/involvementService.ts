import { InvolvementTypeEnum } from "../models/InvolvementData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";


export const getByProjectAndSituation = async (projectId: number, situation: number, page = 1, limit = 20, search?: string) => {
    return await apiTokenProvider.get('/involvement/' + projectId + '/' + situation, { params: { page, limit, search } });
};

export const accept = async (involvementId: number) => {
    return await apiTokenProvider.put('/involvement/accept/' + involvementId, {});
};

export const reject = async (involvementId: number) => {
    return await apiTokenProvider.put('/involvement/reject/' + involvementId, {});
};

export const remove = async (involvementId: number) => {
    return await apiTokenProvider.delete('/involvement/' + involvementId);
};

export const invite = async (projectId: number, email: string, type: InvolvementTypeEnum) => {
    return await apiTokenProvider.post('/involvement/invite', {
        "project": projectId,
        "email": email,
        "type": type
    });
}

export const apply = async (projectId: number) => {
    return await apiTokenProvider.post('/involvement/apply', {
        "project": projectId,
    });
}

export const getInvolvementInvitations = async (page = 1, limit = 20) => {
    return await apiTokenProvider.get('/involvement/invitations', { params: { page, limit } });
};

export const getInvolvementApplied = async (page = 1, limit = 20) => {
    return await apiTokenProvider.get('/involvement/applied', { params: { page, limit } });
};

export const getProjectTesters = async (projectId: number) => {
    return await apiTokenProvider.get('/involvement/project/' + projectId + '/testers');
};
