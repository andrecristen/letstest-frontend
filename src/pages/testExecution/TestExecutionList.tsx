import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TestExecutionItem from "./TestExecutionItem";
import ListLayout from "../../components/ListLayout";
import { TestExecutionData } from "../../models/TestExecutionData";
import { getByTestCase, getMyByTestCase } from "../../services/testExecutionService";
import notifyProvider from "../../infra/notifyProvider";
import { Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { usePageLoading } from "../../hooks/usePageLoading";

const TestExecutionList: React.FC = () => {

    const { t } = useTranslation();
    const { testCaseId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);

    const location = useLocation();
    const isUserView = location.pathname.includes("my");

    const {
        items: testExecutions,
        loadingInitial,
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

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("testExecution.listTitle", { id: testCaseId })}
            filters={(
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
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("testExecution.loadingList")}
            loadingMore={loadingMore}
            empty={filteredTestExecutions.length === 0}
            emptyMessage={t("testExecution.emptyList")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <div className="space-y-4">
                {filteredTestExecutions.map((testExecutions) => (
                    <TestExecutionItem
                        key={testExecutions.id}
                        testExecution={testExecutions}
                        isUserView={isUserView}
                    />
                ))}
            </div>
        </ListLayout>
    );
};

export default TestExecutionList;
