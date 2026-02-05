import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import notifyProvider from '../../infra/notifyProvider';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { FiSave } from 'react-icons/fi';
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from '../../components/CustomizableTable/CustomizableTable';
import { Operation } from '../../components/CustomizableTable/CustomizableRow';
import { TemplateData, TemplateTypeEnum } from '../../models/TemplateData';
import { getAllByProjectAndType } from '../../services/templatesService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../components/LoadingOverlay';
import { TestScenarioData } from '../../models/TestScenarioData';
import { createTestScenario, getTestScenarioById, updateTestScenario } from '../../services/testScenario';
import { useTranslation } from 'react-i18next';
import { Badge } from '../../ui';
import { getProjectById } from '../../services/projectService';
import { ApprovalStatusEnum, getApprovalStatusLabel, getApprovalStatusVariant } from '../../models/ApprovalStatus';
import { getMyProjectRole } from '../../services/involvementService';

const TestScenarioForm = () => {
    const { t } = useTranslation();
    const { projectId, testScenarioId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TestScenarioData>();
    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [loadingTestScenario, setLoadingTestScenario] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);
    const [approvalEnabled, setApprovalEnabled] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState<number | null>(null);
    const [hasExecutions, setHasExecutions] = useState(false);
    const [permissionChecked, setPermissionChecked] = useState(false);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateId = watch('id');
    const updatedProjectId = watch('projectId');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");
    const isReadOnly = isViewMode || hasExecutions;

    const getProjectId = useCallback(() => parseInt(projectId || `${updatedProjectId}`, 10), [projectId, updatedProjectId]);
    const getTestScenarioId = useCallback(() => parseInt(testScenarioId || '0', 10), [testScenarioId]);

    const getTemplates = useCallback(async () => {
        setLoadingTemplates(true);
        try {
            const response = await getAllByProjectAndType(getProjectId(), TemplateTypeEnum.TestScenarioDefinition, 1, 200);
            const newTemplates = response?.data?.data || [];
            setTemplates(newTemplates);
            if (!newTemplates.length) {
                notifyProvider.info(t("testScenario.noTemplatesInfo"));
            }
        } finally {
            setLoadingTemplates(false);
        }
    }, [getProjectId, t]);

    const getTestScenario = useCallback(async () => {
        setLoadingTestScenario(true);
        try {
            const response = await getTestScenarioById(getTestScenarioId());
            const testScenario = response?.data;
            setValue('id', testScenario.id);
            setValue('name', testScenario.name);
            setValue('projectId', testScenario.projectId);
            setApprovalStatus(testScenario.approvalStatus ?? ApprovalStatusEnum.Draft);
            setHasExecutions(Boolean(testScenario.hasExecutions));
            customizableTableRef.current?.setRows(Object.values(testScenario.data));
        } finally {
            setLoadingTestScenario(false);
        }
    }, [getTestScenarioId, setValue]);

    const getProject = useCallback(async () => {
        const id = getProjectId();
        if (!id) return;
        setLoadingProject(true);
        try {
            const response = await getProjectById(id);
            const project = response?.data;
            const enabled = Boolean(project?.approvalEnabled && project?.approvalScenarioEnabled);
            setApprovalEnabled(enabled);
            if (!enabled) {
                setApprovalStatus(ApprovalStatusEnum.Approved);
                setValue("approvalStatus", ApprovalStatusEnum.Approved);
            } else if (!getTestScenarioId()) {
                setApprovalStatus(ApprovalStatusEnum.Draft);
                setValue("approvalStatus", ApprovalStatusEnum.Draft);
            }
        } finally {
            setLoadingProject(false);
        }
    }, [getProjectId, getTestScenarioId, setValue]);

    const checkPermission = useCallback(async (targetProjectId: number) => {
        if (isViewMode) {
            setPermissionChecked(true);
            return true;
        }
        const role = await getMyProjectRole(targetProjectId);
        if (!role?.canManageTests) {
            notifyProvider.error(t("common.noPermission"));
            navigate(-1);
            return false;
        }
        setPermissionChecked(true);
        return true;
    }, [isViewMode, navigate, t]);

    const load = useCallback(async () => {
        let targetProjectId = getProjectId();
        if (getTestScenarioId()) {
            await getTestScenario();
            targetProjectId = updatedProjectId || targetProjectId;
        }
        if (targetProjectId) {
            const hasPermission = await checkPermission(targetProjectId);
            if (!hasPermission) return;
            await getProject();
            await getTemplates();
        }
    }, [getProjectId, getProject, getTestScenarioId, getTemplates, getTestScenario, checkPermission, updatedProjectId]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit: SubmitHandler<TestScenarioData> = async (data) => {
        if (!rows.length) {
            notifyProvider.error(t("testScenario.minRowRequired"));
            return;
        }
        if (isReadOnly) return;

        data.data = Object.fromEntries(rows.map((item) => [item.id, item]));
        delete data.templateId;
        if (!approvalEnabled) {
            delete data.approvalStatus;
        }
        try {
            const response = data.id ? await updateTestScenario(data.id, data) : await createTestScenario(getProjectId(), data);
            const success = response?.status === 200 || response?.status === 201;
            if (success) {
                const actionResult = data.id ? t("common.updatedResult") : t("common.createdResult");
                notifyProvider.success(t("testScenario.saveSuccess", { action: actionResult }));
                navigate(-1);
            } else {
                throw new Error(t("testScenario.unexpectedError"));
            }
        } catch (error) {
            const action = data.id ? t("common.updatedAction") : t("common.createdAction");
            notifyProvider.error(t("testScenario.saveError", { action }));
        }
    };

    const handleChangeTemplate = () => {
        const template = templates.find((item) => item.id === getValues('templateId'));
        customizableTableRef.current?.setRows(template ? Object.values(template.data) : []);
    };


    return (
        <PainelContainer>
            <TitleContainer title={t("testScenario.pageTitle")} />
            <LoadingOverlay show={loadingTemplates || loadingTestScenario || loadingProject || !permissionChecked} />
            {approvalEnabled && (
                <div className="rounded-2xl border border-ink/10 bg-paper px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-ink">{t("common.status")}</span>
                            <Badge variant={getApprovalStatusVariant(approvalStatus)}>
                                {getApprovalStatusLabel(approvalStatus)}
                            </Badge>
                        </div>
                    </div>
                    {hasExecutions && (
                        <p className="mt-2 text-sm text-ink/60">
                            {t("testScenario.lockedByExecution")}
                        </p>
                    )}
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <div className="py-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">#</label>
                        <input
                            {...register('id')}
                            disabled
                            className="form-input"
                            placeholder={t("common.idLabel")}
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t("common.nameLabel")}</label>
                    <input
                        type="text"
                        id="name"
                        disabled={isReadOnly}
                        {...register('name', { required: t("common.nameRequired") })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                {!getTestScenarioId() && (
                    <div className="py-2">
                        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">{t("common.templateLabel")}</label>
                        <select
                            {...register('templateId', {
                                required: t("testScenario.templateRequired"),
                                setValueAs: (value) => parseInt(value, 10),
                                onChange: handleChangeTemplate,
                            })}
                            disabled={isReadOnly}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.templateId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        >
                            <option value="">{t("common.selectTemplate")}</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                        {errors.templateId && <span className="text-red-500 text-sm">{errors.templateId.message}</span>}
                    </div>
                )}
                {!getTestScenarioId() && approvalEnabled && (
                    <div className="py-2">
                        <label htmlFor="approvalStatus" className="block text-sm font-medium text-gray-700">{t("common.status")}</label>
                        <select
                            id="approvalStatus"
                            {...register("approvalStatus", {
                                setValueAs: (value) => parseInt(value, 10),
                            })}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                        >
                            <option value={ApprovalStatusEnum.Draft}>{t("approval.draft")}</option>
                            <option value={ApprovalStatusEnum.Approved}>{t("approval.approved")}</option>
                        </select>
                    </div>
                )}
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">{t("testScenario.definitionLegend")}</legend>
                        {!updateTemplate && !getTestScenarioId() && (
                            <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                                <strong className="font-bold mr-2">{t("common.attention")}</strong>
                                <span>{t("common.selectTemplateWarning")}</span>
                            </div>
                        )}
                        <CustomizableTable
                            ref={customizableTableRef}
                            operation={isReadOnly ? Operation.View : Operation.FillIn}
                            onChange={setRows}
                        />
                    </fieldset>
                </div>
                {!loadingTemplates && !isReadOnly && (
                    <button
                        type="submit"
                        className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex justify-center items-center rounded-md"
                    >
                        <FiSave className="mr-2" />
                        {t("common.save")}
                    </button>
                )}
            </form>
        </PainelContainer>
    );
};

export default TestScenarioForm;
