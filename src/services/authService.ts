import axios, { AxiosError } from "axios";
import { AuthData } from "../types/AuthData";
import { api } from "./apiBaseService";

export const auth = async (data: AuthData) => {
    try {
        return await api.post('/users/auth', data);
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return err.response;
        }
        return null;
    }
};
