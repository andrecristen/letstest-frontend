import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ListLayout from "../../components/ListLayout";
import { getReportsByTestExecution } from "../../services/reportService";
import ReportItem from "./ReportItem";
import { ReportData } from "../../models/ReportData";
import { FiStar } from "react-icons/fi";
import { Card, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { usePageLoading } from "../../hooks/usePageLoading";

const ReportList: React.FC = () => {

    const { t } = useTranslation();
    const { testExecutionId } = useParams<{ testExecutionId: string }>();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);

    const getTestExecutionId = () => {
        return parseInt(testExecutionId || "0", 10);
    };

    const {
        items: reports,
        loadingInitial,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<ReportData>(
        async (page, limit) => {
            try {
                const response = await getReportsByTestExecution(getTestExecutionId(), page, limit);
                return response?.data ?? null;
            } catch (error) {
                console.error(t("reports.loadError"), error);
                return null;
            }
        },
        [testExecutionId],
        { enabled: Boolean(testExecutionId) }
    );

    const filteredReports = useMemo(() => {
        return reports.filter((report) =>
            report.commentary.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reports, searchTerm]);

    const calculateAverageScore = () => {
        if (reports.length === 0) return 0;
        const totalScore = reports.reduce((acc, report) => acc + report.score, 0);
        return (totalScore / reports.length).toFixed(2);
    };

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
            title={t("reports.listTitle", { id: getTestExecutionId() })}
            extraActions={(
                <Card className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                        <FiStar size={28} />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">{t("reports.averageTitle")}</p>
                        <p className="font-display text-2xl text-ink">
                            {calculateAverageScore()} / 5
                        </p>
                    </div>
                </Card>
            )}
            filters={(
                <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <Field label={t("reports.searchLabel")}>
                        <Input
                            type="text"
                            placeholder={t("reports.searchPlaceholder")}
                            value={filterDraft}
                            onChange={(e) => setFilterDraft(e.target.value)}
                        />
                    </Field>
                </div>
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("reports.loadingList")}
            loadingMore={loadingMore}
            empty={filteredReports.length === 0}
            emptyMessage={t("reports.emptyList")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredReports.map((report) => (
                    <ReportItem
                        key={report.id}
                        report={report}
                    />
                ))}
            </div>
        </ListLayout>
    );
};

export default ReportList;
