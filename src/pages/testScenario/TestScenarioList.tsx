import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestScenarioItem from "./TestScenarioItem";
import ListLayout from "../../components/ListLayout";
import { getAllTestScenariosByProjects, updateTestScenarioStatus } from "../../services/testScenario";
import { TestScenarioData } from "../../models/TestScenarioData";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { ApprovalStatusEnum } from "../../models/ApprovalStatus";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { FiPlus } from "react-icons/fi";
import { usePageLoading } from "../../hooks/usePageLoading";

const TestScenarioList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: testScenarios,
        loadingInitial,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<TestScenarioData>(
        async (page, limit) => {
            try {
                const response = await getAllTestScenariosByProjects(parseInt(projectId || "0", 10), page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("testScenario.loadError"));
                return null;
            }
        },
        [projectId, refreshKey],
        { enabled: Boolean(projectId) }
    );

    const filteredTestScenarios = useMemo(() => {
        return testScenarios.filter((testScenario) =>
            testScenario.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [testScenarios, searchTerm]);

    const applyFilters = () => {
        setSearchTerm(filterDraft);
    };

    const clearFilters = () => {
        setFilterDraft("");
        setSearchTerm("");
    };

    const handleApprove = async (testScenarioId?: number) => {
        if (!testScenarioId) return;
        try {
            const response = await updateTestScenarioStatus(testScenarioId, ApprovalStatusEnum.Approved);
            if (response?.status === 200) {
                notifyProvider.success(t("common.updatedResult"));
                setRefreshKey((prev) => prev + 1);
            } else {
                throw new Error("review");
            }
        } catch {
            notifyProvider.error(t("common.processError"));
        }
    };

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("testScenario.listTitle")}
            actions={(
                <Button
                    type="button"
                    onClick={() => navigate(`/test-scenario/${projectId}/add`)}
                    leadingIcon={<FiPlus />}
                >
                    {t("testScenario.createNew")}
                </Button>
            )}
            filters={(
                <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <Field label={t("testScenario.searchLabel")}>
                        <Input
                            type="text"
                            placeholder={t("testScenario.searchPlaceholder")}
                            value={filterDraft}
                            onChange={(e) => setFilterDraft(e.target.value)}
                        />
                    </Field>
                </div>
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("testScenario.loadingList")}
            loadingMore={loadingMore}
            empty={filteredTestScenarios.length === 0}
            emptyMessage={t("testScenario.emptyList")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <div className="space-y-4">
                {filteredTestScenarios.map((testScenario) => (
                    <TestScenarioItem
                        key={testScenario.id}
                        testScenario={testScenario}
                        onViewCases={
                            testScenario.approvalStatus === ApprovalStatusEnum.Approved
                                ? () => navigate(`/project/test-cases/${projectId}?scenarioId=${testScenario.id}`)
                                : undefined
                        }
                        onReview={
                            testScenario.approvalStatus === ApprovalStatusEnum.Draft
                                ? () => handleApprove(testScenario.id)
                                : undefined
                        }
                        onEdit={() => navigate(`/test-scenario/${testScenario.id}/edit`)}
                        onView={() => navigate(`/test-scenario/${testScenario.id}/view`)}
                    />
                ))}
            </div>
        </ListLayout>
    );
};

export default TestScenarioList;
