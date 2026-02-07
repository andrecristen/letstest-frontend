import axios, { AxiosError } from "axios";
import { api } from "./apiBaseProvider";
import tokenProvider from "../tokenProvider";
import notifyProvider from "../notifyProvider";
import { useNavigate } from "react-router-dom";

const getExtraConfigs = () => {
    return {
        headers: {
            Authorization: 'Bearer ' + tokenProvider.getSessionToken()
        }
    }
};

let refreshPromise: Promise<boolean> | null = null;

const refreshSession = async (): Promise<boolean> => {
    const refreshToken = tokenProvider.getRefreshToken();
    if (!refreshToken) {
        return false;
    }
    if (!refreshPromise) {
        refreshPromise = api
            .post("/users/auth/refresh", {
                refreshToken,
                organizationId: tokenProvider.getOrganizationId(),
            })
            .then((response) => {
                if (response?.status === 200 && response.data?.token) {
                    const { token, refreshToken: newRefreshToken, organizations } = response.data;
                    tokenProvider.updateSessionToken(token, newRefreshToken);
                    if (organizations) {
                        tokenProvider.updateOrganizations(organizations);
                    }
                    return true;
                }
                return false;
            })
            .catch(() => false)
            .finally(() => {
                refreshPromise = null;
            });
    }
    return refreshPromise;
};

const validateToken = (error: AxiosError, navigate: ReturnType<typeof useNavigate>) => {
    if (error.response?.status === 401) {
        tokenProvider.removeSession();
        notifyProvider.info("Sua sessão é inválida, por favor efetue login novamente.");
        navigate("/login");
        window.location.assign("/login")
        window.location.reload();
    }
}

const apiTokenProvider = {
    get: async (path: string, extraConfigs?: any) => {
        try {
            const defaultExtraConfigs = getExtraConfigs();
            if (extraConfigs && extraConfigs.headers) {
                defaultExtraConfigs.headers = {...defaultExtraConfigs.headers, ...extraConfigs.headers};
            }
            const finalConfigs = {...extraConfigs, ...defaultExtraConfigs};
            return await api.get(path, finalConfigs);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 401) {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        const retryConfigs = { ...extraConfigs, ...getExtraConfigs() };
                        return await api.get(path, retryConfigs);
                    }
                    validateToken(err, useNavigate);
                    return err.response;
                }
                if (err.response.status === 402) {
                    window.dispatchEvent(new CustomEvent("billing:limit", { detail: err.response.data }));
                }
                return err.response;
            }
            return null;
        }
    },

    post: async (path: string, body: any, extraConfigs? : any) => {
        try {
            const defaultExtraConfigs = getExtraConfigs();
            if (extraConfigs && extraConfigs.headers) {
                defaultExtraConfigs.headers = {...defaultExtraConfigs.headers, ...extraConfigs.headers}
            }
            const finalConfigs = {...extraConfigs, ...defaultExtraConfigs};
            return await api.post(path, body, finalConfigs);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 401) {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        const retryConfigs = { ...extraConfigs, ...getExtraConfigs() };
                        return await api.post(path, body, retryConfigs);
                    }
                    validateToken(err, useNavigate);
                    return err.response;
                }
                if (err.response.status === 402) {
                    window.dispatchEvent(new CustomEvent("billing:limit", { detail: err.response.data }));
                }
                return err.response;
            }
            return null;
        }
    },

    put: async (path: string, body: any) => {
        try {
            return await api.put(path, body, getExtraConfigs());
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 401) {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        return await api.put(path, body, getExtraConfigs());
                    }
                    validateToken(err, useNavigate);
                    return err.response;
                }
                if (err.response.status === 402) {
                    window.dispatchEvent(new CustomEvent("billing:limit", { detail: err.response.data }));
                }
                return err.response;
            }
            return null;
        }
    },

    patch: async (path: string, body: any) => {
        try {
            return await api.patch(path, body, getExtraConfigs());
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 401) {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        return await api.patch(path, body, getExtraConfigs());
                    }
                    validateToken(err, useNavigate);
                    return err.response;
                }
                if (err.response.status === 402) {
                    window.dispatchEvent(new CustomEvent("billing:limit", { detail: err.response.data }));
                }
                return err.response;
            }
            return null;
        }
    },

    delete: async (path: string) => {
        try {
            return await api.delete(path, getExtraConfigs());
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                if (err.response.status === 401) {
                    const refreshed = await refreshSession();
                    if (refreshed) {
                        return await api.delete(path, getExtraConfigs());
                    }
                    validateToken(err, useNavigate);
                    return err.response;
                }
                if (err.response.status === 402) {
                    window.dispatchEvent(new CustomEvent("billing:limit", { detail: err.response.data }));
                }
                return err.response;
            }
            return null;
        }
    }
}

export default apiTokenProvider;
