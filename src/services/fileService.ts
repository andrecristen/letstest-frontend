import apiTokenService from "./apiTokenService";

export const upload = async (formData: FormData, extraConfigs: any) => {
    extraConfigs.headers = {
        "Content-Type": "multipart/form-data",
    };
    return await apiTokenService.post('/file/upload', formData, extraConfigs);
};