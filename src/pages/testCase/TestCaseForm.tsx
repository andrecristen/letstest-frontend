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
import { ApprovalStatusEnum, getApprovalStatusLabel, getApprovalStatusVariant } from '../../models/ApprovalStatus';

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
    const [approvalStatus, setApprovalStatus] = useState<number | null>(null);
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
            setApprovalStatus(testCase.approvalStatus ?? ApprovalStatusEnum.Draft);
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
                setApprovalStatus(ApprovalStatusEnum.Approved);
            } else if (!getTestCaseId()) {
                setApprovalStatus(ApprovalStatusEnum.Draft);
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
                <div className="rounded-2xl border border-ink/10 bg-paper px-4 py-3">
                    <p className="text-sm text-ink/60">
                        {t("testCase.lockedByExecution")}
                    </p>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <div>
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
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">{t("common.dueDateLabel")}</label>
                    <input
                        type="date"
                        id="dueDate"
                        disabled={isReadOnly}
                        {...register('dueDate', {
                            setValueAs: (value) => (value ? value : null),
                        })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                </div>
                <div>
                    <label htmlFor="environmentId" className="block text-sm font-medium text-gray-700">{t("common.environmentLabel")} {!isReadOnly ? (<button className="text-lg" onClick={handleClickNewEnvironment} type="button"><FiPlusCircle /></button>) : null}</label>
                    <select
                        {...register('environmentId', {
                            required: t("testCase.environmentRequired"),
                            setValueAs: (value) => parseInt(value, 10),
                        })}
                        disabled={isReadOnly}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.environmentId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">{t("common.selectEnvironment")}</option>
                        {environments.map((environment) => (
                            <option key={environment.id} value={environment.id}>
                                {environment.name}
                            </option>
                        ))}
                    </select>
                    {errors.environmentId && <span className="text-red-500 text-sm">{errors.environmentId.message}</span>}
                </div>
                <div>
                    <label htmlFor="testScenarioId" className="block text-sm font-medium text-gray-700">{t("common.testScenarioLabel")} {!isReadOnly ? (<button className="text-lg" onClick={handleClickNewTestScenario} type="button"><FiPlusCircle /></button>) : null}</label>
                    <select
                        id='testScenarioId'
                        {...register('testScenarioId', {
                            required: t("testCase.testScenarioRequired"),
                            setValueAs: (value) => parseInt(value, 10),
                        })}
                        disabled={isReadOnly}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.testScenarioId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">{t("common.selectScenario")}</option>
                        {testScenarios
                            .filter((testScenario) => testScenario.approvalStatus === ApprovalStatusEnum.Approved)
                            .map((testScenario) => (
                                <option key={testScenario.id} value={testScenario.id}>
                                    {testScenario.name}
                                </option>
                            ))}
                    </select>
                    {errors.testScenarioId && <span className="text-red-500 text-sm">{errors.testScenarioId.message}</span>}
                </div>
                {!getTestCaseId() && (
                    <div className="py-2">
                        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">{t("common.templateLabel")}</label>
                        <select
                            {...register('templateId', {
                                required: t("testCase.templateRequired"),
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
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">{t("testCase.definitionLegend")}</legend>
                        {!updateTemplate && !getTestCaseId() && (
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

export default TestCaseForm;
