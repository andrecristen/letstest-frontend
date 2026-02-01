import { TestCaseData } from "../models/TestCaseData";
import apiTokenProvider from "../infra/http-request/apiTokenProvider";

type CachedTestCaseEntry = {
    data: Awaited<ReturnType<typeof apiTokenProvider.get>>;
    cachedAt: number;
};

const CACHE_TTL_MS = 3000;
const inFlightById = new Map<number, Promise<Awaited<ReturnType<typeof apiTokenProvider.get>>>>();
const cacheById = new Map<number, CachedTestCaseEntry>();

export const getAllByProjects = async (
    projectId: number,
    page = 1,
    limit = 20,
    filters?: { testScenarioId?: number | null }
) => {
    return await apiTokenProvider.get('/test-case/project/' + projectId, {
        params: { page, limit, ...filters },
    });
};

export const getMyByProjects = async (
    projectId: number,
    page = 1,
    limit = 20,
    filters?: { testScenarioId?: number | null }
) => {
    return await apiTokenProvider.get('/test-case/project/' + projectId + '/assigned', {
        params: { page, limit, ...filters },
    });
};

export const getById = async (testCaseId: number, options?: { force?: boolean }) => {
    if (!testCaseId) return await apiTokenProvider.get('/test-case/' + testCaseId);

    const now = Date.now();
    if (!options?.force) {
        const cached = cacheById.get(testCaseId);
        if (cached && now - cached.cachedAt < CACHE_TTL_MS) {
            return cached.data;
        }
        const inFlight = inFlightById.get(testCaseId);
        if (inFlight) {
            return inFlight;
        }
    }

    const request = apiTokenProvider.get('/test-case/' + testCaseId)
        .then((response) => {
            cacheById.set(testCaseId, { data: response, cachedAt: Date.now() });
            return response;
        })
        .finally(() => {
            inFlightById.delete(testCaseId);
        });

    inFlightById.set(testCaseId, request);
    return request;
};

export const create = async (projectId: number, data: TestCaseData) => {
    return await apiTokenProvider.post('/test-case/' + projectId, data);
}

export const update = async (testCaseId: number, data: TestCaseData) => {
    return await apiTokenProvider.put('/test-case/' + testCaseId, data);
}

export const updateStatus = async (testCaseId: number, status: number) => {
    return await apiTokenProvider.put('/test-case/' + testCaseId + '/status', { status });
}

export const assignTesters = async (testCaseId: number, userIds: number[]) => {
    return await apiTokenProvider.post('/test-case/' + testCaseId + '/assign', { userIds });
}

export const startAssignment = async (testCaseId: number) => {
    return await apiTokenProvider.post('/test-case/' + testCaseId + '/assignment/start', {});
}

export const pauseAssignment = async (testCaseId: number) => {
    return await apiTokenProvider.post('/test-case/' + testCaseId + '/assignment/pause', {});
}

export const resumeAssignment = async (testCaseId: number) => {
    return await apiTokenProvider.post('/test-case/' + testCaseId + '/assignment/resume', {});
}

export const finishAssignment = async (testCaseId: number) => {
    return await apiTokenProvider.post('/test-case/' + testCaseId + '/assignment/finish', {});
}
