import { InvolvementData, InvolvementSituationEnum, InvolvementTypeEnum } from "../types/InvolvementData";
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