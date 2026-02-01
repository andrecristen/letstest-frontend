import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TestExecutionItem from "./TestExecutionItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { TestExecutionData } from "../../models/TestExecutionData";
import { getByTestCase, getMyByTestCase } from "../../services/testExecutionService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiXCircle } from "react-icons/fi";

const TestExecutionList: React.FC = () => {

    const { t } = useTranslation();
    const { testCaseId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);

    const location = useLocation();
    const isUserView = location.pathname.includes("my");

    const {
        items: testExecutions,
        loading: loadingTestExecutions,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<TestExecutionData>(
        async (page, limit) => {
            try {
                if (isUserView) {
                    const response = await getMyByTestCase(parseInt(testCaseId || "0", 10), page, limit);
                    return response?.data ?? null;
                }
                const response = await getByTestCase(parseInt(testCaseId || "0", 10), page, limit);
                return response?.data ?? null;
            } catch (error: any) {
                notifyProvider.error(t("testExecution.loadError", { error: error.toString() }));
                return null;
            }
        },
        [testCaseId, isUserView],
        { enabled: Boolean(testCaseId) }
    );

    const filteredTestExecutions = useMemo(() => {
        return testExecutions.filter((execution) =>
            execution.id?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [testExecutions, searchTerm]);

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
                <TitleContainer title={t("testExecution.listTitle", { id: testCaseId })} />

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        <Field label={t("testExecution.searchLabel")}>
                            <Input
                                type="text"
                                placeholder={t("testExecution.searchPlaceholder")}
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

                {loadingTestExecutions ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("testExecution.loadingList")}
                    </div>
                ) : filteredTestExecutions.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("testExecution.emptyList")}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTestExecutions.map((testExecutions) => (
                            <TestExecutionItem
                                key={testExecutions.id}
                                testExecution={testExecutions}
                                isUserView={isUserView}
                            />
                        ))}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default TestExecutionList;
