import React, { useRef, useState, useEffect } from 'react';
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
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateId = watch('id');
    const updatedProjectId = watch('projectId');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");

    useEffect(() => {
        load();
    }, [projectId, testCaseId, updatedProjectId]);

    const getProjectId = () => parseInt(projectId || updatedProjectId + "", 10);
    const getTestCaseId = () => parseInt(testCaseId || '0', 10);

    const load = async () => {
        if (getProjectId()) {
            await getTemplates();
            await getEnvironments();
            await getTestScenarios();
        }
        if (getTestCaseId()) {
            await getTestCase();
        }
    };

    const getTemplates = async () => {
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
    };

    const getTestCase = async () => {
        setLoadingTestCase(true);
        try {
            const response = await getById(getTestCaseId());
            const testCase = response?.data;
            setValue('id', testCase.id);
            setValue('name', testCase.name);
            setValue('projectId', testCase.projectId);
            setValue('environmentId', testCase.environmentId);
            setValue('testScenarioId', testCase.testScenarioId);
            customizableTableRef.current?.setRows(Object.values(testCase.data));
        } finally {
            setLoadingTestCase(false);
        }
    };

    const getEnvironments = async () => {
        setLoadingEnvironments(true);
        try {
            const response = await getAllByProjects(getProjectId(), 1, 200);
            setEnvironments(response?.data?.data || []);
        } finally {
            setLoadingEnvironments(false);
        }
    };

    const getTestScenarios = async () => {
        setLoadingTestScenarios(true);
        try {
            const response = await getAllTestScenariosByProjects(getProjectId(), 1, 200);
            setTestScenarios(response?.data?.data || []);
        } finally {
            setLoadingTestScenarios(false);
        }
    };

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        if (!rows.length) {
            notifyProvider.error(t("testCase.minRowRequired"));
            return;
        }
        if (isViewMode) return;

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
            <LoadingOverlay show={loadingTemplates || loadingTestCase || loadingEnvironments || loadingTestScenarios} />
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
                        disabled={isViewMode}
                        {...register('name', { required: t("common.nameRequired") })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                <div>
                    <label htmlFor="environmentId" className="block text-sm font-medium text-gray-700">{t("common.environmentLabel")} {!isViewMode ? (<button className="text-lg" onClick={handleClickNewEnvironment} type="button"><FiPlusCircle /></button>) : null}</label>
                    <select
                        {...register('environmentId', {
                            required: t("testCase.environmentRequired"),
                            setValueAs: (value) => parseInt(value, 10),
                        })}
                        disabled={isViewMode}
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
                    <label htmlFor="testScenarioId" className="block text-sm font-medium text-gray-700">{t("common.testScenarioLabel")} {!isViewMode ? (<button className="text-lg" onClick={handleClickNewTestScenario} type="button"><FiPlusCircle /></button>) : null}</label>
                    <select
                        id='testScenarioId'
                        {...register('testScenarioId', {
                            required: t("testCase.testScenarioRequired"),
                            setValueAs: (value) => parseInt(value, 10),
                        })}
                        disabled={isViewMode}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.testScenarioId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">{t("common.selectScenario")}</option>
                        {testScenarios.map((testScenario) => (
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
                            disabled={isViewMode}
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
                            operation={isViewMode ? Operation.View : Operation.FillIn}
                            onChange={setRows}
                        />
                    </fieldset>
                </div>
                {!loadingTemplates && !isViewMode && (
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
