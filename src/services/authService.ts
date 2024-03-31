import axios from "axios";
import { AuthData } from "../types/AuthData";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br"
    }
});

export const auth = async (data: AuthData) => {
    try {
        const response = await api.post('/users/auth', { email: data.email, password: data.password });
        console.log(response);
        return response;
    } catch (err) {
        console.error(err);
        return null;
    }
};
