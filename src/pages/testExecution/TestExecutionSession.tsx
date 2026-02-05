import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from "../../components/CustomizableTable/CustomizableTable";
import { Operation } from "../../components/CustomizableTable/CustomizableRow";
import { getById, pauseAssignment, resumeAssignment, startAssignment } from "../../services/testCaseService";
import notifyProvider from "../../infra/notifyProvider";
import LoadingOverlay from "../../components/LoadingOverlay";
import tokenProvider from "../../infra/tokenProvider";
import { Badge, Button, Card } from "../../ui";
import { FiCheckSquare, FiPause, FiPlay } from "react-icons/fi";
import { useTranslation } from "react-i18next";

type AssignmentStatus = "idle" | "running" | "paused" | "finished";

const TestExecutionSession: React.FC = () => {
    const { t } = useTranslation();
    const { projectId, testCaseId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<AssignmentStatus>("idle");
    const [assignment, setAssignment] = useState<{
        startedAt?: Date | null;
        lastPausedAt?: Date | null;
        totalPausedSeconds?: number;
        finishedAt?: Date | null;
    } | null>(null);
    const [now, setNow] = useState(Date.now());
    const [testCaseName, setTestCaseName] = useState("");
    const [environmentName, setEnvironmentName] = useState("");
    const [environmentDescription, setEnvironmentDescription] = useState("");
    const customizableTableScenarioCaseRef = useRef<CustomizableTableRef>(null);
    const customizableTableTestCaseRef = useRef<CustomizableTableRef>(null);

    const getTestCaseId = useCallback(() => parseInt(testCaseId ?? "0", 10), [testCaseId]);
    const getProjectId = useCallback(() => parseInt(projectId ?? "0", 10), [projectId]);

    const resolveStatus = useCallback((assignmentData: typeof assignment): AssignmentStatus => {
        if (!assignmentData) return "idle";
        if (assignmentData.finishedAt) return "finished";
        if (assignmentData.lastPausedAt) return "paused";
        if (assignmentData.startedAt) return "running";
        return "idle";
    }, []);

    const load = useCallback(async () => {
        const currentId = getTestCaseId();
        if (!currentId) return;
        setLoading(true);
        try {
            const response = await getById(currentId);
            const data = response?.data;
            setTestCaseName(data?.name ?? "");
            setEnvironmentName(data?.environment?.name ?? "");
            setEnvironmentDescription(data?.environment?.description ?? "");
            const scenarioRows: CustomizableTableRows[] = data?.testScenario?.data
                ? Object.values(data.testScenario.data)
                : [];
            const caseRows: CustomizableTableRows[] = data?.data ? Object.values(data.data) : [];
            customizableTableScenarioCaseRef.current?.setRows(scenarioRows);
            customizableTableTestCaseRef.current?.setRows(caseRows);

            const userId = tokenProvider.getSessionUserId();
            const currentAssignment = data?.assignments?.find((item: any) => item.userId === userId);
            const normalizedAssignment = currentAssignment
                ? {
                    startedAt: currentAssignment.startedAt ? new Date(currentAssignment.startedAt) : null,
                    lastPausedAt: currentAssignment.lastPausedAt ? new Date(currentAssignment.lastPausedAt) : null,
                    totalPausedSeconds: currentAssignment.totalPausedSeconds ?? 0,
                    finishedAt: currentAssignment.finishedAt ? new Date(currentAssignment.finishedAt) : null,
                }
                : null;
            setAssignment(normalizedAssignment);
            setStatus(resolveStatus(normalizedAssignment));
        } catch (error) {
            notifyProvider.error(t("testCase.loadError"));
        } finally {
            setLoading(false);
        }
    }, [getTestCaseId, t, resolveStatus]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (status !== "running" || !assignment?.startedAt || assignment.finishedAt || assignment.lastPausedAt) {
            return;
        }
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [status, assignment?.startedAt, assignment?.finishedAt, assignment?.lastPausedAt]);

    const elapsedSeconds = useMemo(() => {
        if (!assignment?.startedAt) return 0;
        const end = assignment.finishedAt
            ? assignment.finishedAt
            : assignment.lastPausedAt
                ? assignment.lastPausedAt
                : new Date(now);
        const totalPaused = assignment.totalPausedSeconds ?? 0;
        const diff = Math.floor((end.getTime() - assignment.startedAt.getTime()) / 1000) - totalPaused;
        return Math.max(0, diff);
    }, [assignment, now]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    };

    const handleStart = async () => {
        try {
            setStatus("running");
            const response = await startAssignment(getTestCaseId());
            if (response?.data) {
                setAssignment({
                    startedAt: response.data.startedAt ? new Date(response.data.startedAt) : assignment?.startedAt ?? new Date(),
                    lastPausedAt: response.data.lastPausedAt ? new Date(response.data.lastPausedAt) : null,
                    totalPausedSeconds: response.data.totalPausedSeconds ?? assignment?.totalPausedSeconds ?? 0,
                    finishedAt: response.data.finishedAt ? new Date(response.data.finishedAt) : null,
                });
            }
            notifyProvider.success(t("testExecution.startSuccess"));
        } catch (error) {
            setStatus("idle");
            notifyProvider.error(t("testCase.startTestError"));
        }
    };

    const handlePause = async () => {
        try {
            setStatus("paused");
            const response = await pauseAssignment(getTestCaseId());
            if (response?.data) {
                setAssignment({
                    startedAt: response.data.startedAt ? new Date(response.data.startedAt) : assignment?.startedAt ?? null,
                    lastPausedAt: response.data.lastPausedAt ? new Date(response.data.lastPausedAt) : new Date(),
                    totalPausedSeconds: response.data.totalPausedSeconds ?? assignment?.totalPausedSeconds ?? 0,
                    finishedAt: response.data.finishedAt ? new Date(response.data.finishedAt) : null,
                });
            }
            notifyProvider.success(t("testExecution.pauseSuccess"));
        } catch (error) {
            setStatus("running");
            notifyProvider.error(t("testCase.pauseTestError"));
        }
    };

    const handleResume = async () => {
        try {
            setStatus("running");
            const response = await resumeAssignment(getTestCaseId());
            if (response?.data) {
                setAssignment({
                    startedAt: response.data.startedAt ? new Date(response.data.startedAt) : assignment?.startedAt ?? null,
                    lastPausedAt: response.data.lastPausedAt ? new Date(response.data.lastPausedAt) : null,
                    totalPausedSeconds: response.data.totalPausedSeconds ?? assignment?.totalPausedSeconds ?? 0,
                    finishedAt: response.data.finishedAt ? new Date(response.data.finishedAt) : null,
                });
            }
            notifyProvider.success(t("testExecution.resumeSuccess"));
        } catch (error) {
            setStatus("paused");
            notifyProvider.error(t("testCase.resumeTestError"));
        }
    };

    const handleReport = () => {
        navigate(`/test-executions/test/${getProjectId()}/${getTestCaseId()}`);
    };

    const statusLabel = useMemo(() => {
        switch (status) {
            case "running":
                return t("testCase.statusRunning");
            case "paused":
                return t("testCase.statusPaused");
            case "finished":
                return t("testCase.statusFinished");
            default:
                return t("testCase.statusIdle");
        }
    }, [status, t]);

    return (
        <PainelContainer>
            <TitleContainer title={t("testExecution.sessionTitle")} />
            <LoadingOverlay show={loading} />
            <div className="space-y-6">
                <Card className="relative overflow-hidden border border-ink/10 bg-paper/80 shadow-sm">
                    <div className="absolute inset-x-0 top-0 h-1 bg-ink/80" />
                    <div className="flex flex-col gap-6 p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="space-y-2">
                                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-ink/40">
                                    {t("testExecution.testCaseLabel")}
                                </p>
                                <p className="font-display text-2xl text-ink">{testCaseName}</p>
                                <div className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
                                    {environmentName ? (
                                        <span>
                                            {t("common.environmentLabel")}: <span className="text-ink/80">{environmentName}</span>
                                        </span>
                                    ) : null}
                                    {environmentDescription ? (
                                        <span className="text-ink/50">• {environmentDescription}</span>
                                    ) : null}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-white/70 px-3 py-2 shadow-sm">
                                <Badge
                                    variant={
                                        status === "running"
                                            ? "info"
                                            : status === "paused"
                                            ? "accent"
                                            : status === "finished"
                                            ? "success"
                                            : "neutral"
                                    }
                                >
                                    {statusLabel}
                                </Badge>
                                <div className="text-sm font-semibold text-ink">
                                    {t("testExecution.elapsedLabel", { time: formatTime(elapsedSeconds) })}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                        {status === "idle" ? (
                            <Button onClick={handleStart} variant="accent" size="sm" leadingIcon={<FiPlay />}>
                                {t("testCase.startTestButton")}
                            </Button>
                        ) : null}
                        {status === "running" ? (
                            <Button onClick={handlePause} variant="outline" size="sm" leadingIcon={<FiPause />}>
                                {t("testCase.pauseTestButton")}
                            </Button>
                        ) : null}
                        {status === "paused" ? (
                            <Button onClick={handleResume} variant="outline" size="sm" leadingIcon={<FiPlay />}>
                                {t("testCase.resumeTestButton")}
                            </Button>
                        ) : null}
                        {status !== "idle" && status !== "finished" ? (
                            <Button onClick={handleReport} variant="primary" size="sm" leadingIcon={<FiCheckSquare />}>
                                {t("testCase.reportTestButton")}
                            </Button>
                        ) : null}
                        </div>
                    </div>
                </Card>

                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">{t("testScenario.definitionLegend")}</legend>
                        <CustomizableTable
                            ref={customizableTableScenarioCaseRef}
                            operation={Operation.View}
                            onChange={() => { }}
                        />
                    </fieldset>
                </div>
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">{t("testCase.definitionLegend")}</legend>
                        <CustomizableTable
                            ref={customizableTableTestCaseRef}
                            operation={Operation.View}
                            onChange={() => { }}
                        />
                    </fieldset>
                </div>
            </div>
        </PainelContainer>
    );
};

export default TestExecutionSession;
