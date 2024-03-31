import axios from "axios";

export const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Accept": "*/*",
        "Connection": "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    }
});