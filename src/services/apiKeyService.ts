import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export type ApiKeyScope = "read" | "write" | "test_executions" | "projects" | "test_cases";

export interface ApiKey {
  id: number;
  name: string;
  keyPrefix: string;
  scopes: ApiKeyScope[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  createdById: number;
  key?: string;
}

export const getApiKeys = async () => {
  return await apiTokenProvider.get("/api-keys");
};

export const createApiKey = async (data: {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: string | null;
}) => {
  return await apiTokenProvider.post("/api-keys", data);
};

export const updateApiKey = async (
  id: number,
  data: { name?: string; scopes?: ApiKeyScope[]; expiresAt?: string | null }
) => {
  return await apiTokenProvider.put(`/api-keys/${id}`, data);
};

export const deleteApiKey = async (id: number) => {
  return await apiTokenProvider.delete(`/api-keys/${id}`);
};
