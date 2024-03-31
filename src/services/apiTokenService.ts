import axios from "axios";
import { api } from "./apiBaseService";
import tokenService from "./tokenService";

const EXTRA_CONFIGS = {
    headers: {
        Authorization: 'Bearer ' + tokenService.getSessionToken()
    }
};

const apiTokenService = {
    get: async (path: string) => {
        try {
            return await api.get(path, EXTRA_CONFIGS);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
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
                return err.response;
            }
            return null;
        }
    }
}

export default apiTokenService;