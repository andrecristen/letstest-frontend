import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TestCaseItem from "./TestCaseItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { TestCaseData } from "../../models/TestCaseData";
import { getMyByProjects } from "../../services/testCaseService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiXCircle } from "react-icons/fi";

const TestCaseProjectTesterList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: testCases,
        loading: loadingTestCases,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<TestCaseData>(
        async (page, limit) => {
            try {
                const response = await getMyByProjects(parseInt(projectId || "0", 10), page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("testCase.loadError"));
                return null;
            }
        },
        [projectId],
        { enabled: Boolean(projectId) }
    );

    const filteredTestCases = useMemo(() => {
        return testCases.filter((testCase) =>
            testCase.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [testCases, searchTerm]);

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
                <TitleContainer title={t("testCase.listTitle")} />

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
                                onView={() => navigate(`/test-case/${testCase.id}/view`)}
                                onExecuteTest={() => navigate(`/test-executions/test/${projectId}/${testCase.id}`)}
                                onTestExecutions={() => navigate(`/test-executions/${testCase.id}/my`)}
                            />
                        ))}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default TestCaseProjectTesterList;
