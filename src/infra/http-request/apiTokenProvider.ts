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
                validateToken(err, useNavigate);
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
                validateToken(err, useNavigate);
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
                validateToken(err, useNavigate);
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
                validateToken(err, useNavigate);
                return err.response;
            }
            return null;
        }
    }
}

export default apiTokenProvider;
