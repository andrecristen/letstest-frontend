import axios, { AxiosError } from "axios";
import { AuthData } from "../types/AuthData";
import { api } from "./apiBaseService";
import { RegisterData } from "../types/RegisterData";

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

export const registerAccount = async (data: RegisterData) => {
    try {
        delete data.confirmPassword;
        return await api.post('/users/register', data);
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            return err.response;
        }
        return null;
    }
};
