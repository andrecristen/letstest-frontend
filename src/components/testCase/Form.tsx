import React, { useRef, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { create, getById, update } from '../../services/testCaseService';
import notifyService from '../../services/notifyService';
import PainelContainer from '../base/PainelContainer';
import TitleContainer from '../base/TitleContainer';
import { TestCaseData } from '../../types/TestCaseData';
import { FiSave } from 'react-icons/fi';
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from '../templates/CustomizableTable';
import { Operation } from '../templates/CustomizableRow';
import { TemplateData, TemplateTypeEnum } from '../../types/TemplateData';
import { getAllByProjectAndType } from '../../services/templatesService';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const TestCaseForm = () => {
    const { projectId, testCaseId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch } = useForm<TestCaseData>();
    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateId = watch('id');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");

    useEffect(() => {
        load();
    }, []);

    const getProjectId = () => parseInt(projectId ?? '0', 10);
    const getTestCaseId = () => parseInt(testCaseId ?? '0', 10);

    const load = async () => {
        if (getProjectId()) {
            setLoadingTemplates(true);
            const response = await getAllByProjectAndType(
                getProjectId(),
                TemplateTypeEnum['Definição de casos de teste']
            );
            setTemplates(response?.data || []);
            setLoadingTemplates(false);
        } else if (getTestCaseId()) {
            const response = await getById(getTestCaseId());
            setValue('id', response?.data.id);
            setValue('name', response?.data.name);
            const newRows: CustomizableTableRows[] = Object.values(response?.data.data);
            customizableTableRef.current?.setRows(newRows);
        }
    };

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        if (!rows.length) {
            notifyService.error('Necessário ao menos uma linha para confirmação.');
            return;
        }

        if (isViewMode) {
            return; // Visualização não deve persistir nada
        }

        data.data = Object.fromEntries(rows.map((item) => [item.id, item]));
        delete data.templateId; // Apenas para uso em tela, API não precisa.

        try {
            let response;
            if (data.id) {
                response = await update(data.id, data);
            } else {
                response = await create(getProjectId(), data);
            }

            if (response?.status === 200 || response?.status === 201) {
                notifyService.success(
                    `Caso de teste ${data.id ? 'alterado' : 'criado'} com sucesso`
                );
                navigate(-1);
            } else {
                throw new Error('Erro inesperado');
            }
        } catch (error) {
            notifyService.error(
                `Erro ao ${data.id ? 'alterar' : 'criar'} Caso de teste, tente novamente`
            );
        }
    };

    const handleChangeTemplate = () => {
        const template = templates.find(
            (item) => item.id === getValues('templateId')
        );
        customizableTableRef.current?.setRows(template ? Object.values(template.data) : []);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Caso de Teste" />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <div className="py-2">
                        <input
                            {...register('id')}
                            disabled
                            className="form-input"
                            placeholder="Id"
                        />
                    </div>
                )}
                <div className="py-2">
                    <input
                        {...register('name', { required: true })}
                        className="form-input"
                        disabled={isViewMode}
                        placeholder="Nome do Caso de Teste"
                    />
                </div>
                {!getTestCaseId() && (
                    <div className="py-2">
                        <select
                            {...register('templateId', {
                                setValueAs: (value) => parseInt(value, 10),
                                onChange: handleChangeTemplate,
                            })}
                            required
                            disabled={isViewMode}
                            className="form-input"
                        >
                            <option value="">Selecione o template</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">Definição do Caso de Teste:</legend>
                        {!updateTemplate && !getTestCaseId() && (
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

export default TestCaseForm;