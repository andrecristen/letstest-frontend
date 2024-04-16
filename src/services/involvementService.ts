import { InvolvementData, InvolvementSituationEnum, InvolvementTypeEnum } from "../types/InvolvementData";
import apiTokenService from "./apiTokenService";


export const getByProjectAndSituation = async (projectId: number, situation: number) => {
    return await apiTokenService.get('/involvement/' + projectId + '/' + situation);
};