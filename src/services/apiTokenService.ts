import axios, { AxiosError } from "axios";
import { api } from "./apiBaseService";
import tokenService from "./tokenService";
import notifyService from "./notifyService";
import { useNavigate } from "react-router-dom";

const EXTRA_CONFIGS = {
    headers: {
        Authorization: 'Bearer ' + tokenService.getSessionToken()
    }
};


const validateToken = (error: AxiosError, navigate: ReturnType<typeof useNavigate>) => {
    if (error.response?.status == 401) {
        tokenService.removeSession();
        notifyService.info("Sua sessão é inválida, por favor efetue login novamente.");
        navigate("/login");
    }
}

const apiTokenService = {
    get: async (path: string) => {
        try {
            return await api.get(path, EXTRA_CONFIGS);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                validateToken(err, useNavigate);
                return err.response;
            }
            return null;
        }
    },

    post: async (path: string, body: any) => {
        try {
            return await api.post(path, body, EXTRA_CONFIGS);
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
            return await api.put(path, body, EXTRA_CONFIGS);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                validateToken(err, useNavigate);
                return err.response;
            }
            return null;
        }
    }
}

export default apiTokenService;