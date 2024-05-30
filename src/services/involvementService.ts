import { InvolvementTypeEnum } from "../types/InvolvementData";
import apiTokenService from "./apiTokenService";


export const getByProjectAndSituation = async (projectId: number, situation: number) => {
    return await apiTokenService.get('/involvement/' + projectId + '/' + situation);
};

export const accept = async (involvementId: number) => {
    return await apiTokenService.put('/involvement/accept/' + involvementId, {});
};

export const reject = async (involvementId: number) => {
    return await apiTokenService.put('/involvement/reject/' + involvementId, {});
};

export const remove = async (involvementId: number) => {
    return await apiTokenService.delete('/involvement/' + involvementId);
};

export const invite = async (projectId: number, email: string, type: InvolvementTypeEnum) => {
    return await apiTokenService.post('/involvement/invite', {
        "project": projectId,
        "email": email,
        "type": type
    });
}

export const apply = async (projectId: number) => {
    return await apiTokenService.post('/involvement/apply', {
        "project": projectId,
    });
}

export const getInvolvementInvitations = async () => {
    return await apiTokenService.get('/involvement/invitations');
};

export const getInvolvementApplied = async () => {
    return await apiTokenService.get('/involvement/applied');
};
