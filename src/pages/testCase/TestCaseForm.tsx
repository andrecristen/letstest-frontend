import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { create, getById, update } from '../../services/testCaseService';
import notifyProvider from '../../infra/notifyProvider';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { TestCaseData } from '../../models/TestCaseData';
import { FiPlusCircle, FiSave } from 'react-icons/fi';
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from '../../components/CustomizableTable/CustomizableTable';
import { Operation } from '../../components/CustomizableTable/CustomizableRow';
import { TemplateData, TemplateTypeEnum } from '../../models/TemplateData';
import { getAllByProjectAndType } from '../../services/templatesService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../components/LoadingOverlay';
import { EnvironmentData } from "../../models/EnvironmentData";
import { getAllByProjects } from '../../services/environmentService';
import { getAllTestScenariosByProjects } from '../../services/testScenario';
import { TestScenarioData } from '../../models/TestScenarioData';
import { useTranslation } from 'react-i18next';
import { getProjectById } from '../../services/projectService';
import { ApprovalStatusEnum } from '../../models/ApprovalStatus';
import { Button, Field, Input, Select } from "../../ui";

const TestCaseForm = () => {
    const { t } = useTranslation();
    const { projectId, testCaseId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TestCaseData>();
    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [environments, setEnvironments] = useState<EnvironmentData[]>([]);
    const [testScenarios, setTestScenarios] = useState<TestScenarioData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [loadingTestCase, setLoadingTestCase] = useState(false);
    const [loadingEnvironments, setLoadingEnvironments] = useState(false);
    const [loadingTestScenarios, setLoadingTestScenarios] = useState(false);
    const [loadingProject, setLoadingProject] = useState(false);
    const [approvalEnabled, setApprovalEnabled] = useState(false);
    const [hasExecutions, setHasExecutions] = useState(false);
    const [resolvedProjectId, setResolvedProjectId] = useState<number | null>(null);
    const lastLoadedTestCaseIdRef = useRef<number | null>(null);
    const lastLoadedProjectIdRef = useRef<number | null>(null);
    const loadedTestCaseRefs = useRef<{ environmentId?: number; testScenarioId?: number } | null>(null);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateId = watch('id');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");
    const isReadOnly = isViewMode || hasExecutions;

    const getProjectId = useCallback(() => {
        const paramId = parseInt(projectId || "0", 10);
        return paramId || resolvedProjectId || 0;
    }, [projectId, resolvedProjectId]);
    const getTestCaseId = useCallback(() => parseInt(testCaseId || '0', 10), [testCaseId]);

    const getTemplates = useCallback(async () => {
        setLoadingTemplates(true);
        try {
            const response = await getAllByProjectAndType(getProjectId(), TemplateTypeEnum.TestCaseDefinition, 1, 200);
            const newTemplates = response?.data?.data || [];
            setTemplates(newTemplates);
            if (!newTemplates.length) {
                notifyProvider.info(t("testCase.noTemplatesInfo"));
            }
        } finally {
            setLoadingTemplates(false);
        }
    }, [getProjectId, t]);

    const getTestCase = useCallback(async () => {
        setLoadingTestCase(true);
        try {
            const response = await getById(getTestCaseId());
            const testCase = response?.data;
            setValue('id', testCase.id);
            setValue('name', testCase.name);
            setValue('projectId', testCase.projectId);
            setValue('environmentId', testCase.environmentId);
            setValue('testScenarioId', testCase.testScenarioId);
            setValue('dueDate', testCase.dueDate ? testCase.dueDate.split("T")[0] : "");
            setHasExecutions((testCase.testExecutions || []).length > 0);
            loadedTestCaseRefs.current = {
                environmentId: testCase.environmentId,
                testScenarioId: testCase.testScenarioId
            };
            customizableTableRef.current?.setRows(Object.values(testCase.data));
            if (testCase?.projectId) {
                setResolvedProjectId(testCase.projectId);
            }
        } finally {
            setLoadingTestCase(false);
        }
    }, [getTestCaseId, setValue]);

    const getProject = useCallback(async () => {
        const id = getProjectId();
        if (!id) return;
        setLoadingProject(true);
        try {
            const response = await getProjectById(id);
            const project = response?.data;
            const enabled = Boolean(project?.approvalEnabled && project?.approvalTestCaseEnabled);
            setApprovalEnabled(enabled);
            if (!enabled) {
                return;
            }
        } finally {
            setLoadingProject(false);
        }
    }, [getProjectId]);

    const getEnvironments = useCallback(async () => {
        setLoadingEnvironments(true);
        try {
            const response = await getAllByProjects(getProjectId(), 1, 200);
            setEnvironments(response?.data?.data || []);
        } finally {
            setLoadingEnvironments(false);
        }
    }, [getProjectId]);

    const getTestScenarios = useCallback(async () => {
        setLoadingTestScenarios(true);
        try {
            const response = await getAllTestScenariosByProjects(getProjectId(), 1, 200);
            setTestScenarios(response?.data?.data || []);
        } finally {
            setLoadingTestScenarios(false);
        }
    }, [getProjectId]);

    const load = useCallback(async () => {
        const currentTestCaseId = getTestCaseId();
        if (currentTestCaseId && lastLoadedTestCaseIdRef.current !== currentTestCaseId) {
            lastLoadedTestCaseIdRef.current = currentTestCaseId;
            await getTestCase();
        }

        const currentProjectId = getProjectId();
        if (currentProjectId && lastLoadedProjectIdRef.current !== currentProjectId) {
            lastLoadedProjectIdRef.current = currentProjectId;
            await getProject();
            await getTemplates();
            await getEnvironments();
            await getTestScenarios();
        }
    }, [getProjectId, getProject, getTestCaseId, getTemplates, getEnvironments, getTestScenarios, getTestCase]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!loadedTestCaseRefs.current) return;
        const { environmentId, testScenarioId } = loadedTestCaseRefs.current;

        if (environmentId && environments.some((environment) => environment.id === environmentId)) {
            setValue('environmentId', environmentId);
        }

        if (testScenarioId && testScenarios.some((testScenario) => testScenario.id === testScenarioId)) {
            setValue('testScenarioId', testScenarioId);
        }
    }, [environments, testScenarios, setValue]);

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        if (!rows.length) {
            notifyProvider.error(t("testCase.minRowRequired"));
            return;
        }
        if (isReadOnly) return;

        data.data = Object.fromEntries(rows.map((item) => [item.id, item]));
        delete data.templateId;

        try {
            const response = data.id ? await update(data.id, data) : await create(getProjectId(), data);
            const success = response?.status === 200 || response?.status === 201;
            if (success) {
                const actionResult = data.id ? t("common.updatedResult") : t("common.createdResult");
                notifyProvider.success(t("testCase.saveSuccess", { action: actionResult }));
                navigate(-1);
            } else {
                throw new Error(t("testCase.unexpectedError"));
            }
        } catch (error) {
            const action = data.id ? t("common.updatedAction") : t("common.createdAction");
            notifyProvider.error(t("testCase.saveError", { action }));
        }
    };

    const handleChangeTemplate = () => {
        const template = templates.find((item) => item.id === getValues('templateId'));
        customizableTableRef.current?.setRows(template ? Object.values(template.data) : []);
    };

    const handleClickNewEnvironment = () => {
        navigate("/project/environments/" + getProjectId());
    }

    const handleClickNewTestScenario = () => {
        navigate("/test-scenario/" + getProjectId() + "/add");
    }


    return (
        <PainelContainer>
            <TitleContainer title={t("testCase.pageTitle")} />
            <LoadingOverlay show={loadingTemplates || loadingTestCase || loadingEnvironments || loadingTestScenarios || loadingProject} />
            {approvalEnabled && hasExecutions && (
                <div className="rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-ember">
                    <p className="text-sm">{t("testCase.lockedByExecution")}</p>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <Field id="id" label="#" hint={t("common.idLabel")}>
                        <Input
                            {...register('id')}
                            id="id"
                            disabled
                            className="bg-ink/5"
                        />
                    </Field>
                )}
                <Field
                    id="name"
                    label={t("common.nameLabel")}
                    error={errors.name?.message as string | undefined}
                >
                    <Input
                        type="text"
                        id="name"
                        disabled={isReadOnly}
                        {...register('name', { required: t("common.nameRequired") })}
                        hasError={Boolean(errors.name)}
                    />
                </Field>
                <Field id="dueDate" label={t("common.dueDateLabel")}>
                    <Input
                        type="date"
                        id="dueDate"
                        disabled={isReadOnly}
                        {...register('dueDate', {
                            setValueAs: (value) => (value ? value : null),
                        })}
                    />
                </Field>
                <Field
                    id="environmentId"
                    label={
                        <span className="inline-flex items-center gap-2">
                            {t("common.environmentLabel")}
                            {!isReadOnly ? (
                                <button className="text-lg text-ocean hover:text-ink" onClick={handleClickNewEnvironment} type="button">
                                    <FiPlusCircle />
                                </button>
                            ) : null}
                        </span>
                    }
                    error={errors.environmentId?.message as string | undefined}
                >
                    <Select
                        {...register('environmentId', {
                            required: t("testCase.environmentRequired"),
                            setValueAs: (value) => parseInt(value, 10),
                        })}
                        disabled={isReadOnly}
                        hasError={Boolean(errors.environmentId)}
                    >
                        <option value="">{t("common.selectEnvironment")}</option>
                        {environments.map((environment) => (
                            <option key={environment.id} value={environment.id}>
                                {environment.name}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field
                    id="testScenarioId"
                    label={
                        <span className="inline-flex items-center gap-2">
                            {t("common.testScenarioLabel")}
                            {!isReadOnly ? (
                                <button className="text-lg text-ocean hover:text-ink" onClick={handleClickNewTestScenario} type="button">
                                    <FiPlusCircle />
                                </button>
                            ) : null}
                        </span>
                    }
                    error={errors.testScenarioId?.message as string | undefined}
                >
                    <Select
                        id='testScenarioId'
                        {...register('testScenarioId', {
                            required: t("testCase.testScenarioRequired"),
                            setValueAs: (value) => parseInt(value, 10),
                        })}
                        disabled={isReadOnly}
                        hasError={Boolean(errors.testScenarioId)}
                    >
                        <option value="">{t("common.selectScenario")}</option>
                        {testScenarios
                            .filter((testScenario) => testScenario.approvalStatus === ApprovalStatusEnum.Approved)
                            .map((testScenario) => (
                                <option key={testScenario.id} value={testScenario.id}>
                                    {testScenario.name}
                                </option>
                            ))}
                    </Select>
                </Field>
                {!getTestCaseId() && (
                    <Field
                        id="templateId"
                        label={t("common.templateLabel")}
                        error={errors.templateId?.message as string | undefined}
                    >
                        <Select
                            {...register('templateId', {
                                required: t("testCase.templateRequired"),
                                setValueAs: (value) => parseInt(value, 10),
                                onChange: handleChangeTemplate,
                            })}
                            disabled={isReadOnly}
                            hasError={Boolean(errors.templateId)}
                        >
                            <option value="">{t("common.selectTemplate")}</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                )}
                <div className="py-2">
                    <fieldset className="rounded-3xl border border-ink/10 bg-paper/70 p-4">
                        <legend className="px-2 text-sm font-semibold text-ink">
                            {t("testCase.definitionLegend")}
                        </legend>
                        {!updateTemplate && !getTestCaseId() && (
                            <div className="mb-4 flex items-center gap-2 rounded-2xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
                                <strong className="font-semibold">{t("common.attention")}</strong>
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
                    <div className="pt-4">
                        <Button
                            type="submit"
                            variant="accent"
                            size="lg"
                            leadingIcon={<FiSave />}
                        >
                            {t("common.save")}
                        </Button>
                    </div>
                )}
            </form>
        </PainelContainer>
    );
};

export default TestCaseForm;
