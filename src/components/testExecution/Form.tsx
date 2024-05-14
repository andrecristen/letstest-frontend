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
import Timer from '../base/Timer';

const TestExecutionForm = () => {
    const { projectId, testCaseId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch } = useForm<TestCaseData>();
    const customizableTableTestCaseRef = useRef<CustomizableTableRef>(null);
    const customizableTableTestExecutionRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const navigate = useNavigate();

    const updateTemplate = watch('templateId');
    const updateId = watch('id');
    const location = useLocation();

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
                TemplateTypeEnum["Execução de casos de teste"]
            );
            const newTemplates = response?.data || [];
            setTemplates(newTemplates);
            if (!newTemplates.length) {
                notifyService.info("Não há nenhum template para Execução de casos de teste para o seu projeto, certifique-se de criar ao menos.");
            }
            setLoadingTemplates(false);
        }
        if (getTestCaseId()) {
            const response = await getById(getTestCaseId());
            setValue('id', response?.data.id);
            setValue('name', response?.data.name);
            const newRows: CustomizableTableRows[] = Object.values(response?.data.data);
            customizableTableTestCaseRef.current?.setRows(newRows);
        }
    };

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {

    };

    const handleChangeTemplate = () => {
        const template = templates.find(
            (item) => item.id === getValues('templateId')
        );
        customizableTableTestExecutionRef.current?.setRows(template ? Object.values(template.data) : []);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Testar Caso de Teste" />
            <div onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">

                <div className="py-2">
                    <input
                        {...register('name', { required: true })}
                        className="form-input"
                        disabled
                        placeholder="Nome do Caso de Teste"
                    />
                </div>
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">Definição do Caso de Teste:</legend>
                        <CustomizableTable
                            ref={customizableTableTestCaseRef}
                            operation={Operation.View}
                            onChange={() => { }}
                        />
                    </fieldset>
                </div>
                <Timer
                    title="Executar caso de teste"
                    onChange={() => { }}
                />
                <div className="py-2">
                    <select
                        {...register('templateId', {
                            setValueAs: (value) => parseInt(value, 10),
                            onChange: handleChangeTemplate,
                        })}
                        required
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
                <div className="py-2">
                    <fieldset className="border rounded p-4">
                        <legend className="text-lg font-semibold">Reportar execução do Caso de Teste:</legend>
                        <CustomizableTable
                            ref={customizableTableTestExecutionRef}
                            operation={Operation.FillIn}
                            onChange={setRows}
                        />
                    </fieldset>
                </div>
                {!loadingTemplates && updateTemplate ? (
                    <button
                        type="submit"
                        className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex justify-center items-center rounded-md"
                    >
                        <FiSave className="mr-2" />
                        Salvar
                    </button>
                ) : null}
            </div>
        </PainelContainer>
    );
};

export default TestExecutionForm;