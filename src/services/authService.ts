import axios from "axios";
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
        const response = await api.post('/users/auth', data);
        console.log(response);
        return response;
    } catch (err) {
        console.error(err);
        return null;
    }
};
