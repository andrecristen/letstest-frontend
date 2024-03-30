import axios from "axios";
import { AuthData } from "../types/AuthData";

const URL_API = process.env.REACT_APP_API_URL;

console.log(URL_API);

const api = axios.create({
    baseURL: URL_API,
});

export const auth = async (data: AuthData) => {
    try {
        debugger
        const response = api.post('/users/auth', { email: data.email, password: data.password });
        console.log(response);
        return response;
    } catch (err) {
        debugger;
        console.error(err);
        return null;
    }
};
