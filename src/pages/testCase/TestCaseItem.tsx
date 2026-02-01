import React from "react";
import { FiEdit, FiEye, FiPackage, FiFileText, FiPlayCircle, FiMove } from "react-icons/fi";
import { TestCaseData } from "../../models/TestCaseData";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../../ui";
import { useTranslation } from "react-i18next";

interface TestCaseItemProps {
    testCase: TestCaseData
    onEdit?: () => void;
    onView?: () => void;
    onTestExecutions?: () => void;
    onExecuteTest?: () => void;
}

const TestCaseItem: React.FC<TestCaseItemProps> = ({ testCase, onEdit, onView, onTestExecutions, onExecuteTest }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                    <FiFileText className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                        #{testCase.id}
                    </p>
                    <p className="font-display text-lg text-ink">{testCase.name}</p>
                    {testCase.testScenario?.name && (
                        <p className="text-sm text-ink/60">{testCase.testScenario?.name}</p>
                    )}
                    <div className="pt-2 text-xs uppercase tracking-[0.2em] text-ink/40">
                        {t("common.environmentLabel")}
                    </div>
                    <p className="text-sm text-ink/60">
                        {testCase.environment?.name || t("common.noEnvironment")}
                    </p>
                    {testCase.environment?.description && (
                        <p className="text-sm text-ink/50">
                            {testCase.environment.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {testCase.testScenario?.id ? (
                    <Button
                        onClick={() => navigate("/test-scenario/" + testCase.testScenario?.id + "/view")}
                        variant="outline"
                        size="sm"
                        leadingIcon={<FiMove />}
                    >
                        {t("testCase.scenarioButton")}
                    </Button>
                ) : null}

                {onEdit ? (
                    <Button onClick={onEdit} variant="outline" size="sm" leadingIcon={<FiEdit />}>
                        {t("common.edit")}
                    </Button>
                ) : null}

                {onView ? (
                    <Button onClick={onView} variant="primary" size="sm" leadingIcon={<FiEye />}>
                        {t("common.view")}
                    </Button>
                ) : null}

                {onTestExecutions ? (
                    <Button onClick={onTestExecutions} variant="outline" size="sm" leadingIcon={<FiPackage />}>
                        {t("testCase.executionsButton")}
                    </Button>
                ) : null}

                {onExecuteTest ? (
                    <Button onClick={onExecuteTest} variant="accent" size="sm" leadingIcon={<FiPlayCircle />}>
                        {t("testCase.testButton")}
                    </Button>
                ) : null}
            </div>
        </Card>
    );
};

export default TestCaseItem;
