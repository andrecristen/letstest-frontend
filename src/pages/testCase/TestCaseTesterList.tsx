import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TestCaseItem from "./TestCaseItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { TestCaseData } from "../../models/TestCaseData";
import { getMyByProjects } from "../../services/testCaseService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input, Select } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiList, FiPlayCircle, FiXCircle } from "react-icons/fi";
import { getAllTestScenariosByProjects } from "../../services/testScenario";
import { TestScenarioData } from "../../models/TestScenarioData";
import tokenProvider from "../../infra/tokenProvider";

const TestCaseProjectTesterList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const [testScenarios, setTestScenarios] = useState<TestScenarioData[]>([]);
    const [scenarioFilter, setScenarioFilter] = useState<number | null>(() => {
        const params = new URLSearchParams(location.search);
        const scenarioId = params.get("scenarioId");
        return scenarioId ? parseInt(scenarioId, 10) : null;
    });
    const [scenarioDraft, setScenarioDraft] = useState<number | null>(scenarioFilter);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [statusDraft, setStatusDraft] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"list" | "kanban">(() => {
        const stored = localStorage.getItem("testCaseTesterViewMode");
        return stored === "kanban" ? "kanban" : "list";
    });
    const {
        items: testCases,
        loading: loadingTestCases,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<TestCaseData>(
        async (page, limit) => {
            try {
                const response = await getMyByProjects(parseInt(projectId || "0", 10), page, limit, {
                    testScenarioId: scenarioFilter,
                });
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("testCase.loadError"));
                return null;
            }
        },
        [projectId, scenarioFilter],
        { enabled: Boolean(projectId) }
    );

    const filteredTestCases = useMemo(() => {
        const userId = tokenProvider.getSessionUserId();
        return testCases.filter((testCase) => {
            if (!testCase.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (statusFilter === "all") {
                return true;
            }
            const assignment = testCase.assignments?.find((item) => item.userId === userId);
            const isFinished = Boolean(assignment?.finishedAt);
            const isPaused = Boolean(assignment?.lastPausedAt) && !isFinished;
            const isRunning = Boolean(assignment?.startedAt) && !assignment?.lastPausedAt && !isFinished;
            const isIdle = !assignment?.startedAt && !assignment?.finishedAt;
            if (statusFilter === "idle") return isIdle;
            if (statusFilter === "running") return isRunning;
            if (statusFilter === "paused") return isPaused;
            if (statusFilter === "finished") return isFinished;
            return true;
        });
    }, [testCases, searchTerm, statusFilter]);

    const getExecutionStatus = useCallback((testCase: TestCaseData) => {
        const userId = tokenProvider.getSessionUserId();
        const assignment = testCase.assignments?.find((item) => item.userId === userId);
        const isFinished = Boolean(assignment?.finishedAt);
        const isPaused = Boolean(assignment?.lastPausedAt) && !isFinished;
        const isRunning = Boolean(assignment?.startedAt) && !assignment?.lastPausedAt && !isFinished;
        const isIdle = !assignment?.startedAt && !assignment?.finishedAt;
        if (isRunning) return "running";
        if (isPaused) return "paused";
        if (isFinished) return "finished";
        if (isIdle) return "idle";
        return "idle";
    }, []);

    const getStatusBadge = useCallback((status: string) => {
        if (status === "running") return { label: t("testCase.statusRunning"), variant: "success" as const };
        if (status === "paused") return { label: t("testCase.statusPaused"), variant: "accent" as const };
        if (status === "finished") return { label: t("testCase.statusFinished"), variant: "neutral" as const };
        return { label: t("testCase.statusIdle"), variant: "neutral" as const };
    }, [t]);

    const renderExecutionAction = useCallback(
        (testCase: TestCaseData, compact?: boolean) => {
            const status = getExecutionStatus(testCase);
            if (status === "finished") {
                return null;
            }
            return (
                <Button
                    onClick={() => navigate(`/test-executions/session/${projectId}/${testCase.id}`)}
                    variant="accent"
                    size="sm"
                    leadingIcon={<FiPlayCircle />}
                    title={compact ? t("testCase.openExecutionButton") : undefined}
                    aria-label={compact ? t("testCase.openExecutionButton") : undefined}
                >
                    {compact ? <span className="sr-only">{t("testCase.openExecutionButton")}</span> : t("testCase.openExecutionButton")}
                </Button>
            );
        },
        [getExecutionStatus, navigate, projectId, t]
    );

    const applyFilters = () => {
        setSearchTerm(filterDraft);
        setScenarioFilter(scenarioDraft);
        setStatusFilter(statusDraft);
    };

    const clearFilters = () => {
        setFilterDraft("");
        setSearchTerm("");
        setScenarioFilter(null);
        setScenarioDraft(null);
        setStatusFilter("all");
        setStatusDraft("all");
    };

    const loadTestScenarios = useCallback(async () => {
        if (!projectId) return;
        try {
            const response = await getAllTestScenariosByProjects(parseInt(projectId, 10), 1, 200);
            setTestScenarios(response?.data?.data ?? []);
        } catch {
            notifyProvider.error(t("testScenario.loadError"));
        }
    }, [projectId, t]);

    React.useEffect(() => {
        loadTestScenarios();
    }, [loadTestScenarios]);

    React.useEffect(() => {
        localStorage.setItem("testCaseTesterViewMode", viewMode);
    }, [viewMode]);

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("testCase.listTitle")} />

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant={viewMode === "list" ? "primary" : "outline"}
                        onClick={() => setViewMode("list")}
                        leadingIcon={<FiList />}
                    >
                        {t("testCase.viewList")}
                    </Button>
                    <Button
                        type="button"
                        variant={viewMode === "kanban" ? "primary" : "outline"}
                        onClick={() => setViewMode("kanban")}
                    >
                        {t("testCase.viewKanban")}
                    </Button>
                </div>

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        <Field label={t("testCase.searchLabel")}>
                            <Input
                                type="text"
                                placeholder={t("testCase.searchPlaceholder")}
                                value={filterDraft}
                                onChange={(e) => setFilterDraft(e.target.value)}
                            />
                        </Field>
                        <Field label={t("common.testScenarioLabel")}>
                            <Select
                                value={scenarioDraft ?? ""}
                                onChange={(event) => {
                                    const value = event.target.value ? parseInt(event.target.value, 10) : null;
                                    setScenarioDraft(value);
                                }}
                            >
                                <option value="">{t("common.all")}</option>
                                {testScenarios.map((scenario) => (
                                    <option key={scenario.id} value={scenario.id}>
                                        {scenario.name}
                                    </option>
                                ))}
                            </Select>
                        </Field>
                        <Field label={t("testCase.statusFilterLabel")}>
                            <Select
                                value={statusDraft}
                                onChange={(event) => setStatusDraft(event.target.value)}
                            >
                                <option value="all">{t("common.all")}</option>
                                <option value="idle">{t("testCase.statusIdle")}</option>
                                <option value="running">{t("testCase.statusRunning")}</option>
                                <option value="paused">{t("testCase.statusPaused")}</option>
                                <option value="finished">{t("testCase.statusFinished")}</option>
                            </Select>
                        </Field>
                    </div>
                    <div className="flex w-full justify-end gap-2 pt-2">
                        <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                            {t("common.confirm")}
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                            {t("common.clearFilters")}
                        </Button>
                    </div>
                </div>

                {loadingTestCases ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("testCase.loadingList")}
                    </div>
                ) : filteredTestCases.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("testCase.emptyList")}
                    </div>
                ) : viewMode === "list" ? (
                    <div className="space-y-4">
                        {filteredTestCases.map((testCase) => {
                            const status = getExecutionStatus(testCase);
                            return (
                                <TestCaseItem
                                    key={testCase.id}
                                    testCase={testCase}
                                    onView={() => navigate(`/test-case/${testCase.id}/view`)}
                                    onTestExecutions={() => navigate(`/test-executions/${testCase.id}/my`)}
                                    statusBadge={getStatusBadge(status)}
                                    customActions={renderExecutionAction(testCase, false)}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-4">
                        {["idle", "running", "paused", "finished"].map((statusKey) => {
                            const columnItems = filteredTestCases.filter(
                                (item) => getExecutionStatus(item) === statusKey
                            );
                            return (
                                <div key={statusKey} className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-paper/70 p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                            {getStatusBadge(statusKey).label}
                                        </span>
                                        <span className="text-xs text-ink/50">{columnItems.length}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {columnItems.map((testCase) => (
                                            <TestCaseItem
                                                key={testCase.id}
                                                testCase={testCase}
                                                onView={() => navigate(`/test-case/${testCase.id}/view`)}
                                                onTestExecutions={() => navigate(`/test-executions/${testCase.id}/my`)}
                                                statusBadge={getStatusBadge(statusKey)}
                                                actionsPosition="footer"
                                                layout="stacked"
                                                compactActions
                                                customActions={renderExecutionAction(testCase, true)}
                                            />
                                        ))}
                                        {columnItems.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-ink/10 p-4 text-center text-xs text-ink/40">
                                                {t("testCase.emptyStatusColumn")}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default TestCaseProjectTesterList;
