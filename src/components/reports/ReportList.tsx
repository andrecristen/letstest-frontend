import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PainelContainer from "../base/PainelContainer";
import TitleContainer from "../base/TitleContainer";
import { getReportsByTestExecution } from "../../services/reportService";
import ReportItem from "./ReportItem";
import { ReportData } from "../../types/ReportData";
import { FiStar } from "react-icons/fi";

const ReportList: React.FC = () => {

    const { testExecutionId } = useParams<{ testExecutionId: string }>();
    const [reports, setReports] = useState<ReportData[]>([]);
    const [loadingReports, setLoadingReports] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    useEffect(() => {
        loadReports();
    }, [testExecutionId]);

    const getTestExecutionId = () => {
        return parseInt(testExecutionId || "0", 10);
    };

    const loadReports = async () => {
        setLoadingReports(true);
        try {
            const response = await getReportsByTestExecution(getTestExecutionId());
            setReports(response?.data || []);
        } catch (error) {
            console.error("Erro ao carregar avaliações", error);
        } finally {
            setLoadingReports(false);
        }
    };

    const filteredReports = reports.filter((report) =>
        report.commentary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAverageScore = () => {
        if (reports.length === 0) return 0;
        const totalScore = reports.reduce((acc, report) => acc + report.score, 0);
        return (totalScore / reports.length).toFixed(2);
    };

    return (
        <PainelContainer>
            <TitleContainer title={`Avaliações da execução # ${getTestExecutionId()}`} />
            <div className="flex justify-between mb-4">
                <input
                    type="text"
                    placeholder="Buscar por comentário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input mr-2"
                />
            </div>
            <div className="bg-white shadow rounded-lg p-4 mb-4 flex items-center">
                <FiStar className="text-yellow-500 mr-2" size={36} />
                <div>
                    <h2 className="text-xl font-bold text-gray-700">Média das Avaliações</h2>
                    <p className="text-2xl text-purple-600">{calculateAverageScore()} / 5</p>
                </div>
            </div>
            {loadingReports ? (
                <div className="text-center text-purple-600 text-lg m-20">Carregando avaliações da execução do caso de teste...</div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center text-purple-600 text-lg m-20">Nenhuma avaliação encontrada</div>
            ) : (
                <div className="cards-list-inline">
                    {filteredReports.map((report) => (
                        <ReportItem
                            key={report.id}
                            report={report}
                        />
                    ))}
                </div>
            )}
        </PainelContainer>
    );
};

export default ReportList;