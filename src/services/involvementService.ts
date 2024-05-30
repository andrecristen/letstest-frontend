import { InvolvementTypeEnum } from "../models/InvolvementData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";


export const getByProjectAndSituation = async (projectId: number, situation: number) => {
    return await apiTokenProvider.get('/involvement/' + projectId + '/' + situation);
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

export const getInvolvementInvitations = async () => {
    return await apiTokenProvider.get('/involvement/invitations');
};

export const getInvolvementApplied = async () => {
    return await apiTokenProvider.get('/involvement/applied');
};
