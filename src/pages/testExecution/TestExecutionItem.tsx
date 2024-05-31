import React, { useEffect, useRef } from "react";
import { FiFileText, FiList, FiStar } from "react-icons/fi";
import { Operation } from "../templates/CustomizableRow";
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from "../templates/CustomizableTable";
import { TestExecutionData } from "../../models/TestExecutionData";
import { useNavigate } from "react-router-dom";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import ReportForm from "../reports/ReportForm";

interface TestExecutionItemProps {
    testExecution: TestExecutionData;
    isUserView: boolean;
}

const TestExecutionItem: React.FC<TestExecutionItemProps> = ({ testExecution, isUserView }) => {

    const navigate = useNavigate();
    const customizableTableTestExecutionRef = useRef<CustomizableTableRef>(null);
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

    useEffect(() => {
        const newRows: CustomizableTableRows[] = Object.values(testExecution.data);
        customizableTableTestExecutionRef.current?.setRows(newRows);
    }, []);

    const handleClickProfileUser = (testExecution: TestExecutionData) => {
        navigate("/profile/" + testExecution.user?.id);
    }

    const handleClickAddReport = (event: React.MouseEvent) => {
        event.preventDefault();
        formDialogRef.current?.openDialog();
    };

    const handleClickListReports = (event: React.MouseEvent, testExecution: TestExecutionData) => {
        event.preventDefault();
        navigate("/reports/test-execution/" + testExecution.id);
    }

    const formatTime = (seconds: number): string => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {testExecution.id}</p>
                    <p className="text-sm text-gray-500">Testado por: <a href="" className="border-b border-purple-400" onClick={() => { handleClickProfileUser(testExecution) }}>{testExecution.user?.name}</a></p>
                    <p className="text-sm text-gray-500">Tempo de execução: {formatTime(testExecution.testTime)}</p>
                    <p className="text-sm text-gray-500">Dispositivo de execução: {testExecution.device?.model} ({testExecution.device?.brand} - {testExecution.device?.system})</p>
                </div>
            </div>
            <div className="w-full">
                <CustomizableTable
                    ref={customizableTableTestExecutionRef}
                    operation={Operation.View}
                    onChange={() => { }}
                />
            </div>
            {!isUserView ? (
                <div className="w-full mt-2">
                    <button onClick={(event) => { handleClickAddReport(event) }} className="w-full text-lg font-bold flex items-center justify-center px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800">
                        <FiStar className="mr-2" />
                        Avaliar
                    </button>
                </div>
            ) : null}
            <div className="w-full mt-2">
                <button onClick={(event) => { handleClickListReports(event, testExecution) }} className="w-full text-lg font-bold flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800">
                    <FiList className="mr-2" />
                    Avaliações
                </button>
            </div>
            <ReportForm ref={formDialogRef} testExecution={testExecution} />
        </div>
    );
};

export default TestExecutionItem;