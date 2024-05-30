import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const upload = async (formData: FormData, extraConfigs: any) => {
    extraConfigs.headers = {
        "Content-Type": "multipart/form-data",
    };
    return await apiTokenProvider.post('/file/upload', formData, extraConfigs);
};