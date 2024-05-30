import axios, { AxiosError } from "axios";
import { AuthData } from "../../models/AuthData";
import { api } from "./apiBaseProvider";
import { RegisterData } from "../../models/RegisterData";

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
