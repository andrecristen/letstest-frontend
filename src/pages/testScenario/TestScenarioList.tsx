import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestScenarioItem from "./TestScenarioItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { getAllTestScenariosByProjects } from "../../services/testScenario";
import { TestScenarioData } from "../../models/TestScenarioData";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiPlus, FiXCircle } from "react-icons/fi";

const TestScenarioList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: testScenarios,
        loading: loadingTestScenarios,
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
        [projectId],
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

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("testScenario.listTitle")} />

                <div className="flex flex-wrap items-end justify-end gap-4">
                    <Button
                        type="button"
                        onClick={() => navigate(`/test-scenario/${projectId}/add`)}
                        leadingIcon={<FiPlus />}
                    >
                        {t("testScenario.createNew")}
                    </Button>
                </div>

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
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
                    <div className="flex w-full justify-end gap-2 pt-2">
                        <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                            {t("common.confirm")}
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                            {t("common.clearFilters")}
                        </Button>
                    </div>
                </div>

                {loadingTestScenarios ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("testScenario.loadingList")}
                    </div>
                ) : filteredTestScenarios.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("testScenario.emptyList")}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTestScenarios.map((testScenario) => (
                            <TestScenarioItem
                                key={testScenario.id}
                                testScenario={testScenario}
                                onEdit={() => navigate(`/test-scenario/${testScenario.id}/edit`)}
                                onView={() => navigate(`/test-scenario/${testScenario.id}/view`)}
                            />
                        ))}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default TestScenarioList;
