import React from "react";
import { FiStar } from "react-icons/fi";
import { ReportData, getReportTypeDescription } from "../../models/ReportData";
import { useNavigate } from "react-router-dom";

interface ReportItemProps {
    report: ReportData;
}

const ReportItem: React.FC<ReportItemProps> = ({ report }) => {

    const navigate = useNavigate();

    const handleClickProfileUser = () => {
        navigate("/profile/" + report.user?.id);
    }

    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiStar className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {report.id}</p>
                    <p className="font-bold text-lg text-purple-700">{report.score} / 5</p>
                    <p className="text-sm text-purple-700">Avaliado por: <a href="" className="border-b border-purple-400" onClick={handleClickProfileUser}>{report.user?.name}</a></p>
                    <p className="text-sm text-purple-700">Situação: {getReportTypeDescription(report.type)}</p>
                    <p className="text-sm text-purple-700">Comentário: {report.commentary}</p>
                </div>
            </div>
        </div>
    );
};

export default ReportItem;