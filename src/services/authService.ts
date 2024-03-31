import axios, { AxiosError } from "axios";
import { AuthData } from "../types/AuthData";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
});

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
