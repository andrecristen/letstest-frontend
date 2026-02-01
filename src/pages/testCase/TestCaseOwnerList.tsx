import React, { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import TestCaseItem from "./TestCaseItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { TestCaseData } from "../../models/TestCaseData";
import { getAllByProjects } from "../../services/testCaseService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input, Select } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiPlus, FiXCircle } from "react-icons/fi";
import { getAllTestScenariosByProjects } from "../../services/testScenario";
import { TestScenarioData } from "../../models/TestScenarioData";
import AssignTestersModal from "./AssignTestersModal";

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
    const {
        items: testCases,
        loading: loadingTestCases,
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

    const filteredTestCases = useMemo(() => {
        return testCases.filter((testCase) =>
            testCase.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [testCases, searchTerm]);

    const applyFilters = () => {
        setSearchTerm(filterDraft);
        setScenarioFilter(scenarioDraft);
    };

    const clearFilters = () => {
        setFilterDraft("");
        setSearchTerm("");
        setScenarioFilter(null);
        setScenarioDraft(null);
    };

    const loadTestScenarios = async () => {
        if (!projectId) return;
        try {
            const response = await getAllTestScenariosByProjects(parseInt(projectId, 10), 1, 200);
            setTestScenarios(response?.data?.data ?? []);
        } catch {
            notifyProvider.error(t("testScenario.loadError"));
        }
    };

    React.useEffect(() => {
        loadTestScenarios();
    }, [projectId]);

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
            <TitleContainer title={t("testCase.listTitle")} />

            <div className="flex flex-wrap items-end justify-end gap-4">
                <Button
                    type="button"
                    onClick={() => navigate(`/test-case/${projectId}/add`)}
                    leadingIcon={<FiPlus />}
                >
                    {t("testCase.createNew")}
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
                ) : (
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
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
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
        </PainelContainer>
    );
};

export default TestCaseProjectOwnerList;
