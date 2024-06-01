import React, { useRef, useState, useEffect } from 'react';
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

const TestScenarioForm = () => {
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

    useEffect(() => {
        load();
    }, [projectId, testScenarioId, updatedProjectId]);

    const getProjectId = () => parseInt(projectId || updatedProjectId + "", 10);
    const getTestScenarioId = () => parseInt(testScenarioId || '0', 10);

    const load = async () => {
        if (getProjectId()) {
            await getTemplates();
        }
        if (getTestScenarioId()) {
            await getTestScenario();
        }
    };

    const getTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const response = await getAllByProjectAndType(getProjectId(), TemplateTypeEnum['Definição de cenários de teste']);
            const newTemplates = response?.data || [];
            setTemplates(newTemplates);
            if (!newTemplates.length) {
                notifyProvider.info("Não há nenhum template para Definição de cenários de teste para o seu projeto, certifique-se de criar ao menos.");
            }
        } finally {
            setLoadingTemplates(false);
        }
    };

    const getTestScenario = async () => {
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
    };

    const onSubmit: SubmitHandler<TestScenarioData> = async (data) => {
        if (!rows.length) {
            notifyProvider.error('Necessário ao menos uma linha para confirmação.');
            return;
        }
        if (isViewMode) return;

        data.data = Object.fromEntries(rows.map((item) => [item.id, item]));
        delete data.templateId;
        try {
            const response = data.id ? await updateTestScenario(data.id, data) : await createTestScenario(getProjectId(), data);
            const success = response?.status === 200 || response?.status === 201;
            if (success) {
                notifyProvider.success(`Cenário de teste ${data.id ? 'alterado' : 'criado'} com sucesso`);
                navigate(-1);
            } else {
                throw new Error('Erro inesperado');
            }
        } catch (error) {
            notifyProvider.error(`Erro ao ${data.id ? 'alterar' : 'criar'} Cenário de teste, tente novamente`);
        }
    };

    const handleChangeTemplate = () => {
        const template = templates.find((item) => item.id === getValues('templateId'));
        customizableTableRef.current?.setRows(template ? Object.values(template.data) : []);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Cenário de Teste" />
            <LoadingOverlay show={loadingTemplates || loadingTestScenario} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <div className="py-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">#</label>
                        <input
                            {...register('id')}
                            disabled
                            className="form-input"
                            placeholder="Id"
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        id="name"
                        disabled={isViewMode}
                        {...register('name', { required: 'Nome é obrigatório' })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                {!getTestScenarioId() && (
                    <div className="py-2">
                        <label htmlFor="templateId" className="block text-sm font-medium text-gray-700">Template</label>
                        <select
                            {...register('templateId', {
                                required: 'Template é obrigatório',
                                setValueAs: (value) => parseInt(value, 10),
                                onChange: handleChangeTemplate,
                            })}
                            disabled={isViewMode}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.templateId ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        >
                            <option value="">Selecione o template</option>
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
                        <legend className="text-lg font-semibold">Definição do Cenário de Teste:</legend>
                        {!updateTemplate && !getTestScenarioId() && (
                            <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center">
                                <strong className="font-bold mr-2">Atenção!</strong>
                                <span>Selecione o template desejado para preenchimento.</span>
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
                        Salvar
                    </button>
                )}
            </form>
        </PainelContainer>
    );
};

export default TestScenarioForm;