import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { getReportsByTestExecution } from "../../services/reportService";
import ReportItem from "./ReportItem";
import { ReportData } from "../../models/ReportData";
import { FiStar } from "react-icons/fi";
import { Button, Card, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiXCircle } from "react-icons/fi";

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
        loading: loadingReports,
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

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("reports.listTitle", { id: getTestExecutionId() })} />

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
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
                    <div className="flex w-full justify-end gap-2 pt-2">
                        <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                            {t("common.confirm")}
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                            {t("common.clearFilters")}
                        </Button>
                    </div>
                </div>

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

                {loadingReports ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("reports.loadingList")}
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("reports.emptyList")}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        {filteredReports.map((report) => (
                            <ReportItem
                                key={report.id}
                                report={report}
                            />
                        ))}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default ReportList;
