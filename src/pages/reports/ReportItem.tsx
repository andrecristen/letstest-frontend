import React from "react";
import { FiMessageCircle, FiStar, FiUser } from "react-icons/fi";
import { ReportData, getReportTypeDescription } from "../../models/ReportData";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge, Card } from "../../ui";

interface ReportItemProps {
    report: ReportData;
}

const ReportItem: React.FC<ReportItemProps> = ({ report }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClickProfileUser = () => {
        navigate("/profile/" + report.user?.id);
    }

    const getScoreTone = (score: number) => {
        if (score >= 4) return "bg-emerald-100 text-emerald-700";
        if (score >= 3) return "bg-amber-100 text-amber-700";
        return "bg-rose-100 text-rose-700";
    };

    return (
        <Card className="space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/50">
                        {t("reports.idLabel", { id: report.id })}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${getScoreTone(report.score)}`}>
                            {report.score} / 5
                        </span>
                        <Badge variant="neutral">
                            {getReportTypeDescription(report.type)}
                        </Badge>
                    </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                    <FiStar />
                </div>
            </div>
            <div className="grid gap-2 text-sm text-ink/70">
                <button
                    type="button"
                    className="flex items-center gap-2 text-left text-ink/70 hover:text-ink"
                    onClick={handleClickProfileUser}
                >
                    <FiUser className="text-ink/50" />
                    <span>{t("reports.ratedByLabel")}: {report.user?.name}</span>
                </button>
                <div className="flex items-start gap-2">
                    <FiMessageCircle className="mt-0.5 text-ink/50" />
                    <p>{report.commentary || t("common.noComment")}</p>
                </div>
            </div>
        </Card>
    );
};

export default ReportItem;
