import React, { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TestCaseItem from "./TestCaseItem";
import ListLayout from "../../components/ListLayout";
import { TestCaseData } from "../../models/TestCaseData";
import { getAllByProjects } from "../../services/testCaseService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input, Select } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { FiList, FiPlus } from "react-icons/fi";
import { getAllTestScenariosByProjects } from "../../services/testScenario";
import { TestScenarioData } from "../../models/TestScenarioData";
import AssignTestersModal from "./AssignTestersModal";
import { usePageLoading } from "../../hooks/usePageLoading";

const TestCaseProjectOwnerList: React.FC = () => {

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
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignTestCase, setAssignTestCase] = useState<TestCaseData | null>(null);
    const [testerFilter, setTesterFilter] = useState<number | null>(null);
    const [testerDraft, setTesterDraft] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<"list" | "kanban">(() => {
        const stored = localStorage.getItem("testCaseOwnerViewMode");
        return stored === "kanban" ? "kanban" : "list";
    });
    const {
        items: testCases,
        loadingInitial,
        loadingMore,
        hasNext,
        sentinelRef,
        reload,
    } = useInfiniteList<TestCaseData>(
        async (page, limit) => {
            try {
                const response = await getAllByProjects(parseInt(projectId || "0", 10), page, limit, {
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

    const availableTesters = useMemo(() => {
        const map = new Map<number, { id: number; name: string }>();
        testCases.forEach((testCase) => {
            testCase.assignments?.forEach((assignment) => {
                if (assignment.user?.id && assignment.user?.name) {
                    map.set(assignment.user.id, { id: assignment.user.id, name: assignment.user.name });
                }
            });
        });
        return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [testCases]);

    const filteredTestCases = useMemo(() => {
        return testCases.filter((testCase) => {
            if (!testCase.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                return false;
            }
            if (testerFilter) {
                return Boolean(testCase.assignments?.some((assignment) => assignment.userId === testerFilter));
            }
            return true;
        });
    }, [testCases, searchTerm, testerFilter]);

    const applyFilters = () => {
        setSearchTerm(filterDraft);
        setScenarioFilter(scenarioDraft);
        setTesterFilter(testerDraft);
    };

    const clearFilters = () => {
        setFilterDraft("");
        setSearchTerm("");
        setScenarioFilter(null);
        setScenarioDraft(null);
        setTesterFilter(null);
        setTesterDraft(null);
    };

    const getAssignmentStatus = (testCase: TestCaseData) => {
        const assignments = testCase.assignments ?? [];
        if (testerFilter) {
            const assignment = assignments.find((item) => item.userId === testerFilter);
            if (!assignment) return "unassigned";
            if (assignment.finishedAt) return "done";
            if (assignment.lastPausedAt) return "paused";
            if (assignment.startedAt) return "in_progress";
            return "not_started";
        }
        if (assignments.length === 0) return "unassigned";
        if (assignments.some((item) => item.finishedAt)) return "done";
        if (assignments.some((item) => item.lastPausedAt)) return "paused";
        if (assignments.some((item) => item.startedAt)) return "in_progress";
        return "not_started";
    };

    const columns = [
        { key: "unassigned", label: t("testCase.kanbanUnassigned"), variant: "neutral" },
        { key: "not_started", label: t("testCase.kanbanNotStarted"), variant: "info" },
        { key: "in_progress", label: t("testCase.kanbanInProgress"), variant: "accent" },
        { key: "paused", label: t("testCase.kanbanPaused"), variant: "danger" },
        { key: "done", label: t("testCase.kanbanDone"), variant: "success" },
    ] as const;

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
        localStorage.setItem("testCaseOwnerViewMode", viewMode);
    }, [viewMode]);

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("testCase.listTitle")}
            actions={(
                <Button
                    type="button"
                    onClick={() => navigate(`/test-case/${projectId}/add`)}
                    leadingIcon={<FiPlus />}
                >
                    {t("testCase.createNew")}
                </Button>
            )}
            extraActions={(
                <>
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
                </>
            )}
            filters={(
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
                    <Field label={t("testCase.testerFilterLabel")}>
                        <Select
                            value={testerDraft ?? ""}
                            onChange={(event) => {
                                const value = event.target.value ? parseInt(event.target.value, 10) : null;
                                setTesterDraft(value);
                            }}
                        >
                            <option value="">{t("common.all")}</option>
                            {availableTesters.map((tester) => (
                                <option key={tester.id} value={tester.id}>
                                    {tester.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
        loading={loadingInitial}
        loadingMessage={t("testCase.loadingList")}
        loadingMore={loadingMore}
        empty={filteredTestCases.length === 0}
            emptyMessage={t("testCase.emptyList")}
        footer={(
            <>
                {hasNext ? <div ref={sentinelRef} /> : null}
                <AssignTestersModal
                    open={assignOpen}
                    projectId={parseInt(projectId || "0", 10)}
                    testCaseId={assignTestCase?.id ?? null}
                    initialSelected={assignTestCase?.assignments?.map((item) => item.userId) ?? []}
                    readOnly={Boolean(assignTestCase?.assignments && assignTestCase.assignments.length > 0)}
                    onClose={() => {
                        setAssignOpen(false);
                        setAssignTestCase(null);
                    }}
                    onAssigned={() => {
                        setAssignOpen(false);
                        setAssignTestCase(null);
                        reload();
                    }}
                />
            </>
        )}
    >
            {viewMode === "list" ? (
                <div className="space-y-4">
                    {filteredTestCases.map((testCase) => (
                        <TestCaseItem
                            key={testCase.id}
                            testCase={testCase}
                            onAssign={() => {
                                setAssignTestCase(testCase);
                                setAssignOpen(true);
                            }}
                            onViewAssignment={() => {
                                setAssignTestCase(testCase);
                                setAssignOpen(true);
                            }}
                            onEdit={() => navigate(`/test-case/${testCase.id}/edit`)}
                            onView={() => navigate(`/test-case/${testCase.id}/view`)}
                            onTestExecutions={() => navigate(`/test-executions/${testCase.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 xl:grid-cols-5">
                    {columns.map((column) => {
                        const items = filteredTestCases.filter((testCase) => getAssignmentStatus(testCase) === column.key);
                        return (
                            <div
                                key={column.key}
                                className="flex min-h-[240px] flex-col gap-3 rounded-2xl border border-ink/10 bg-paper/70 p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                                        {column.label}
                                    </span>
                                    <span className="text-xs text-ink/50">{items.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {items.map((testCase) => (
                                        <TestCaseItem
                                            key={testCase.id}
                                            testCase={testCase}
                                            layout="stacked"
                                            actionsPosition="footer"
                                            compactActions
                                            statusBadge={{ label: column.label, variant: column.variant }}
                                            onAssign={() => {
                                                setAssignTestCase(testCase);
                                                setAssignOpen(true);
                                            }}
                                            onViewAssignment={() => {
                                                setAssignTestCase(testCase);
                                                setAssignOpen(true);
                                            }}
                                            onEdit={() => navigate(`/test-case/${testCase.id}/edit`)}
                                            onView={() => navigate(`/test-case/${testCase.id}/view`)}
                                            onTestExecutions={() => navigate(`/test-executions/${testCase.id}`)}
                                        />
                                    ))}
                                    {items.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-ink/10 px-3 py-6 text-center text-xs text-ink/50">
                                            {t("testCase.kanbanEmpty")}
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </ListLayout>
    );
};

export default TestCaseProjectOwnerList;
