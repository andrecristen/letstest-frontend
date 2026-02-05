import { api } from "../infra/http-request/apiBaseProvider";

export type SystemConfig = {
    isSelfHosted: boolean;
    billingEnabled: boolean;
    maxOrganizations: number | null;
};

export const getConfig = async (): Promise<SystemConfig> => {
    const response = await api.get("/config");
    return response.data;
};
