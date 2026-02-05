import apiTokenProvider from "../infra/http-request/apiTokenProvider";

export const getPlans = async () => {
  return await apiTokenProvider.get("/billing/plans");
};

export const getSubscription = async () => {
  return await apiTokenProvider.get("/billing/subscription");
};

export const getUsage = async () => {
  return await apiTokenProvider.get("/billing/usage");
};

export const createCheckout = async (plan: string) => {
  return await apiTokenProvider.post("/billing/checkout", { plan });
};

export const createPortal = async () => {
  return await apiTokenProvider.post("/billing/portal", {});
};
