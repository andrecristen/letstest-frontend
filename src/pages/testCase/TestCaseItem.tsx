import React, { useState } from "react";
import { FiEdit, FiEye, FiPackage, FiFileText, FiPlayCircle, FiMove, FiUsers, FiUserPlus, FiExternalLink } from "react-icons/fi";
import { TestCaseData } from "../../models/TestCaseData";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Modal } from "../../ui";
import { useTranslation } from "react-i18next";
import { getEnvironmentSituationDescription } from "../../models/EnvironmentData";

interface TestCaseItemProps {
    testCase: TestCaseData
    onEdit?: () => void;
    onView?: () => void;
    onTestExecutions?: () => void;
    onExecuteTest?: () => void;
    onAssign?: () => void;
    onViewAssignment?: () => void;
    customActions?: React.ReactNode;
    statusBadge?: { label: string; variant?: "neutral" | "accent" | "success" | "danger" | "info" };
    actionsPosition?: "inline" | "footer";
    layout?: "inline" | "stacked";
    compactActions?: boolean;
}

const TestCaseItem: React.FC<TestCaseItemProps> = ({
    testCase,
    onEdit,
    onView,
    onTestExecutions,
    onExecuteTest,
    onAssign,
    onViewAssignment,
    customActions,
    statusBadge,
    actionsPosition = "inline",
    layout = "inline",
    compactActions = false
}) => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);

    return (
        <>
        <Card className={layout === "stacked" ? `flex flex-col ${actionsPosition === "footer" ? "overflow-hidden" : ""}` : "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"}>
            {layout === "stacked" ? (
                <>
                    <div className="flex items-start justify-between gap-3 border-b border-ink/5 px-4 py-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink/40">
                                <span>#{testCase.id}</span>
                            </div>
                            <p className="font-display text-lg text-ink">{testCase.name}</p>
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                                {statusBadge ? (
                                    <Badge variant={statusBadge.variant}>
                                        {statusBadge.label}
                                    </Badge>
                                ) : testCase.assignments && testCase.assignments.length > 0 ? (
                                    <Badge variant="success">
                                        {t("testCase.assignedStatus")}
                                    </Badge>
                                ) : (
                                    <Badge variant="neutral">
                                        {t("testCase.awaitingAssignment")}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end text-xs text-ink/40">
                            {testCase.dueDate ? (
                                <span>{new Date(testCase.dueDate).toLocaleDateString()}</span>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 px-4 py-3">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                {t("common.testScenarioLabel")}
                            </p>
                            {testCase.testScenario?.id ? (
                                <a
                                    href={`/test-scenario/${testCase.testScenario?.id}/view`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-left text-sm font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
                                >
                                    <span>{testCase.testScenario?.name}</span>
                                    <FiExternalLink className="h-4 w-4 text-ink/40" />
                                </a>
                            ) : (
                                <p className="text-sm text-ink/70">
                                    {t("testCase.noScenario")}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                {t("common.environmentLabel")}
                            </p>
                            {testCase.projectId ? (
                                <button
                                    type="button"
                                    onClick={() => setShowEnvironmentModal(true)}
                                    className="flex items-center gap-2 text-left text-sm font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
                                >
                                    <span>{testCase.environment?.name || t("common.noEnvironment")}</span>
                                    <FiEye className="h-4 w-4 text-ink/40" />
                                </button>
                            ) : (
                                <p className="text-sm text-ink/70">
                                    {testCase.environment?.name || t("common.noEnvironment")}
                                </p>
                            )}
                            {testCase.environment?.description && (
                                <p className="text-sm text-ink/50">
                                    {testCase.environment.description}
                                </p>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex items-start gap-3">
                    <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                        <FiFileText className="h-5 w-5" />
                    </span>
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                            #{testCase.id}
                        </p>
                        <p className="font-display text-lg text-ink">{testCase.name}</p>
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                            {statusBadge ? (
                                <Badge variant={statusBadge.variant}>
                                    {statusBadge.label}
                                </Badge>
                            ) : testCase.assignments && testCase.assignments.length > 0 ? (
                                <Badge variant="success">
                                    {t("testCase.assignedStatus")}
                                </Badge>
                            ) : (
                                <Badge variant="neutral">
                                    {t("testCase.awaitingAssignment")}
                                </Badge>
                            )}
                        </div>
                        <div className="pt-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                {t("common.testScenarioLabel")}
                            </p>
                            {testCase.testScenario?.id ? (
                                <a
                                    href={`/test-scenario/${testCase.testScenario?.id}/view`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-left text-sm font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
                                >
                                    <span>{testCase.testScenario?.name}</span>
                                    <FiExternalLink className="h-4 w-4 text-ink/40" />
                                </a>
                            ) : (
                                <p className="text-sm text-ink/60">{t("testCase.noScenario")}</p>
                            )}
                        </div>
                        <div className="pt-2">
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                                {t("common.environmentLabel")}
                            </p>
                            {testCase.projectId ? (
                                <button
                                    type="button"
                                    onClick={() => setShowEnvironmentModal(true)}
                                    className="flex items-center gap-2 text-left text-sm font-medium text-ink underline decoration-ink/20 underline-offset-4 transition-colors hover:text-ink"
                                >
                                    <span>{testCase.environment?.name || t("common.noEnvironment")}</span>
                                    <FiEye className="h-4 w-4 text-ink/40" />
                                </button>
                            ) : (
                                <p className="text-sm text-ink/60">
                                    {testCase.environment?.name || t("common.noEnvironment")}
                                </p>
                            )}
                        </div>
                        {testCase.environment?.description && (
                            <p className="text-sm text-ink/50">
                                {testCase.environment.description}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div
                className={
                    actionsPosition === "footer"
                        ? "mt-auto flex w-full flex-wrap items-center gap-2 border-t border-ink/10 bg-paper/70 px-3 py-3"
                        : layout === "stacked"
                            ? "flex flex-wrap items-center gap-2 px-4 pb-4"
                            : "flex flex-wrap items-center gap-2"
                }
            >
                {onAssign && (!testCase.assignments || testCase.assignments.length === 0) ? (
                    compactActions ? (
                        <Button
                            onClick={onAssign}
                            variant="accent"
                            size="sm"
                            iconOnly
                            className="h-10 w-10"
                            leadingIcon={<FiUserPlus />}
                            title={t("testCase.assignAction")}
                            aria-label={t("testCase.assignAction")}
                        >
                            <span className="sr-only">{t("testCase.assignAction")}</span>
                        </Button>
                    ) : (
                        <Button onClick={onAssign} variant="accent" size="sm">
                            {t("testCase.assignAction")}
                        </Button>
                    )
                ) : null}
                {onViewAssignment && testCase.assignments && testCase.assignments.length > 0 ? (
                    compactActions ? (
                        <Button
                            onClick={onViewAssignment}
                            variant="outline"
                            size="sm"
                            iconOnly
                            className="h-10 w-10"
                            leadingIcon={<FiUsers />}
                            title={t("testCase.viewAssignment")}
                            aria-label={t("testCase.viewAssignment")}
                        >
                            <span className="sr-only">{t("testCase.viewAssignment")}</span>
                        </Button>
                    ) : (
                        <Button onClick={onViewAssignment} variant="outline" size="sm" leadingIcon={<FiUsers />}>
                            {t("testCase.viewAssignment")}
                        </Button>
                    )
                ) : null}

                {testCase.testScenario?.id ? (
                    compactActions ? (
                        <Button
                            onClick={() => navigate("/test-scenario/" + testCase.testScenario?.id + "/view")}
                            variant="outline"
                            size="sm"
                            iconOnly
                            className="h-10 w-10"
                            leadingIcon={<FiMove />}
                            title={t("testCase.scenarioButton")}
                            aria-label={t("testCase.scenarioButton")}
                        >
                            <span className="sr-only">{t("testCase.scenarioButton")}</span>
                        </Button>
                    ) : (
                        <Button
                            onClick={() => navigate("/test-scenario/" + testCase.testScenario?.id + "/view")}
                            variant="outline"
                            size="sm"
                            leadingIcon={<FiMove />}
                        >
                            {t("testCase.scenarioButton")}
                        </Button>
                    )
                ) : null}

                {onEdit ? (
                    compactActions ? (
                        <Button
                            onClick={onEdit}
                            variant="outline"
                            size="sm"
                            iconOnly
                            className="h-10 w-10"
                            leadingIcon={<FiEdit />}
                            title={t("common.edit")}
                            aria-label={t("common.edit")}
                        >
                            <span className="sr-only">{t("common.edit")}</span>
                        </Button>
                    ) : (
                        <Button onClick={onEdit} variant="outline" size="sm" leadingIcon={<FiEdit />}>
                            {t("common.edit")}
                        </Button>
                    )
                ) : null}

                {onView ? (
                    compactActions ? (
                        <Button
                            onClick={onView}
                            variant="primary"
                            size="sm"
                            iconOnly
                            className="h-10 w-10"
                            leadingIcon={<FiEye />}
                            title={t("common.view")}
                            aria-label={t("common.view")}
                        >
                            <span className="sr-only">{t("common.view")}</span>
                        </Button>
                    ) : (
                        <Button onClick={onView} variant="primary" size="sm" leadingIcon={<FiEye />}>
                            {t("common.view")}
                        </Button>
                    )
                ) : null}

                {onTestExecutions ? (
                    compactActions ? (
                        <Button
                            onClick={onTestExecutions}
                            variant="outline"
                            size="sm"
                            iconOnly
                            className="h-10 w-10"
                            leadingIcon={<FiPackage />}
                            title={t("testCase.executionsButton")}
                            aria-label={t("testCase.executionsButton")}
                        >
                            <span className="sr-only">{t("testCase.executionsButton")}</span>
                        </Button>
                    ) : (
                        <Button onClick={onTestExecutions} variant="outline" size="sm" leadingIcon={<FiPackage />}>
                            {t("testCase.executionsButton")}
                        </Button>
                    )
                ) : null}

                {onExecuteTest ? (
                    <Button onClick={onExecuteTest} variant="accent" size="sm" leadingIcon={<FiPlayCircle />}>
                        {t("testCase.testButton")}
                    </Button>
                ) : null}
                {customActions ? customActions : null}
            </div>
        </Card>

        <Modal open={showEnvironmentModal} onClose={() => setShowEnvironmentModal(false)}>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg text-ink">{t("common.environmentLabel")}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowEnvironmentModal(false)}>
                        {t("common.close")}
                    </Button>
                </div>
                <div className="space-y-2 text-sm text-ink/70">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("common.nameLabel")}</p>
                        <p className="font-medium text-ink">{testCase.environment?.name || t("common.noEnvironment")}</p>
                    </div>
                    {testCase.environment?.description ? (
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("common.descriptionLabel")}</p>
                            <p className="text-ink/70">{testCase.environment.description}</p>
                        </div>
                    ) : null}
                    {testCase.environment?.situation ? (
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("common.status")}</p>
                            <p className="text-ink/70">
                                {getEnvironmentSituationDescription(testCase.environment.situation) || "-"}
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </Modal>
        </>
    );
};

export default TestCaseItem;
