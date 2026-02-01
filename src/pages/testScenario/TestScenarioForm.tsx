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

const TestScenarioForm = () => {
    const { t } = useTranslation();
    const { projectId, testScenarioId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TestScenarioData>();
    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [loadingTestScenario, setLoadingTestScenario] = useState(false);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateId = watch('id');
    const updatedProjectId = watch('projectId');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");

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
            customizableTableRef.current?.setRows(Object.values(testScenario.data));
        } finally {
            setLoadingTestScenario(false);
        }
    }, [getTestScenarioId, setValue]);

    const load = useCallback(async () => {
        if (getProjectId()) {
            await getTemplates();
        }
        if (getTestScenarioId()) {
            await getTestScenario();
        }
    }, [getProjectId, getTestScenarioId, getTemplates, getTestScenario]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit: SubmitHandler<TestScenarioData> = async (data) => {
        if (!rows.length) {
            notifyProvider.error(t("testScenario.minRowRequired"));
            return;
        }
        if (isViewMode) return;

        data.data = Object.fromEntries(rows.map((item) => [item.id, item]));
        delete data.templateId;
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
            <LoadingOverlay show={loadingTemplates || loadingTestScenario} />
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
                        disabled={isViewMode}
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
                        <legend className="text-lg font-semibold">{t("testScenario.definitionLegend")}</legend>
                        {!updateTemplate && !getTestScenarioId() && (
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

export default TestScenarioForm;
