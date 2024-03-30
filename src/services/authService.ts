import axios from "axios";
import {AuthData} from "../types/AuthData";

const URL_API = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: URL_API,
});

export const login = async (data : AuthData) => {
    return api.post('/users/auth', data).then((result) => {
        console.log(result);
        return result;
    }).catch((error) => {
        console.log(error);
        return error.response;
    });
};
