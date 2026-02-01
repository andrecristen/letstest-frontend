import React, { useEffect, useRef } from "react";
import { FiFileText, FiList, FiStar } from "react-icons/fi";
import { Operation } from "../../components/CustomizableTable/CustomizableRow";
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from "../../components/CustomizableTable/CustomizableTable";
import { TestExecutionData } from "../../models/TestExecutionData";
import { useNavigate } from "react-router-dom";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import ReportForm from "../reports/ReportForm";
import { Button, Card } from "../../ui";
import { useTranslation } from "react-i18next";

interface TestExecutionItemProps {
    testExecution: TestExecutionData;
    isUserView: boolean;
}

const TestExecutionItem: React.FC<TestExecutionItemProps> = ({ testExecution, isUserView }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const customizableTableTestExecutionRef = useRef<CustomizableTableRef>(null);
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

    useEffect(() => {
        const newRows: CustomizableTableRows[] = Object.values(testExecution.data);
        customizableTableTestExecutionRef.current?.setRows(newRows);
    }, [testExecution.data]);

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
        <Card className="space-y-4">
            <div className="flex flex-wrap items-center gap-4">
                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                    <FiFileText className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                        #{testExecution.id}
                    </p>
                    <p className="text-sm text-ink/60">
                        {t("testExecution.testedByLabel")}:{" "}
                        <button
                            type="button"
                            className="font-semibold text-ocean hover:text-ink"
                            onClick={() => handleClickProfileUser(testExecution)}
                        >
                            {testExecution.user?.name}
                        </button>
                    </p>
                    <p className="text-sm text-ink/60">
                        {t("testExecution.executionTimeLabel")}: {formatTime(testExecution.testTime)}
                    </p>
                    <p className="text-sm text-ink/60">
                        {t("testExecution.deviceLabel")}: {testExecution.device?.model} ({testExecution.device?.brand} -{" "}
                        {testExecution.device?.system})
                    </p>
                </div>
            </div>
            <div className="w-full">
                <CustomizableTable
                    ref={customizableTableTestExecutionRef}
                    operation={Operation.View}
                    onChange={() => { }}
                />
            </div>
            <div className="flex flex-wrap gap-2">
                {!isUserView ? (
                    <Button
                        onClick={(event) => { handleClickAddReport(event) }}
                        variant="accent"
                        leadingIcon={<FiStar />}
                    >
                        {t("testExecution.evaluateButton")}
                    </Button>
                ) : null}
                <Button
                    onClick={(event) => { handleClickListReports(event, testExecution) }}
                    variant="outline"
                    leadingIcon={<FiList />}
                >
                    {t("testExecution.ratingsButton")}
                </Button>
            </div>
            <ReportForm ref={formDialogRef} testExecution={testExecution} />
        </Card>
    );
};

export default TestExecutionItem;
