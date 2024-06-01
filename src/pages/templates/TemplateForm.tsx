import React, { useEffect, useRef, useState } from 'react';
import { FiSave } from 'react-icons/fi';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TemplateData, getTemplateTypeList } from '../../models/TemplateData';
import { create, getById } from '../../services/templatesService';
import notifyProvider from '../../infra/notifyProvider';
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from '../../components/CustomizableTable/CustomizableTable';
import { Operation } from '../../components/CustomizableTable/CustomizableRow';
import LoadingOverlay from "../../components/LoadingOverlay";

const TemplateForm = () => {

    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<TemplateData>();
    const [isLoadedTemplateCopy, setIsLoadedTemplateCopy] = useState<boolean>(false);
    const [loadingTemplate, setLoadingTemplate] = useState<boolean>(false);
    const { projectId, templateIdCopy } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const isViewMode = location.pathname.includes("view");

    useEffect(() => {
        if (!isLoadedTemplateCopy) {
            loadOfCopy();
        }
    }, [rows]);

    const loadOfCopy = async () => {
        setIsLoadedTemplateCopy(true);
        if (templateIdCopy) {
            setLoadingTemplate(true);
            const templateCopyData = await getById(parseInt(templateIdCopy));
            if (templateCopyData?.data?.data) {
                if (isViewMode) {
                    setValue("name", templateCopyData?.data.name);
                    setValue("description", templateCopyData?.data.description);
                    setValue("type", templateCopyData?.data.type);
                }
                const newRows: CustomizableTableRows[] = Object.values(templateCopyData.data.data);
                customizableTableRef.current?.setRows(newRows);
            }
            setLoadingTemplate(false);
        }
    }

    function getProjectId(): number {
        return parseInt(projectId ? projectId : "0");
    }

    const onSubmit: SubmitHandler<TemplateData> = async (data, event) => {
        event?.preventDefault();
        event?.stopPropagation();
        if (event?.target?.attributes?.name?.nodeValue == "template") {
            if (!rows.length) {
                notifyProvider.error("Necessário ao menos uma linha para confirmação.");
                return;
            }
            data.data = Object.fromEntries(
                rows.map(item => [item.id, item])
            );
            setLoadingTemplate(true);
            const response = await create(getProjectId(), data);
            if (response?.status == 201) {
                notifyProvider.success("Template criado com sucesso");
                navigate(-1);
            } else {
                notifyProvider.error("Erro ao criar template, tente novamente");
            }
            setLoadingTemplate(false);
        }
    }

    return (
        <PainelContainer>
            <TitleContainer title={isViewMode ? "Visualizar Template" : "Personalizar Template"} />
            <LoadingOverlay show={loadingTemplate} />
            <form name={'template'} onSubmit={handleSubmit(onSubmit)}>
                <div className="py-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        {...register('name', { required: 'Nome é obrigatório' })}
                        disabled={isViewMode}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        placeholder="Nome"
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                <div className="py-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        {...register("description", { required: 'Descrição é obrigatória' })}
                        rows={5}
                        disabled={isViewMode}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        placeholder="Descrição"
                    />
                    {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
                </div>
                <div className="py-2">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                        {...register('type', {
                            required: 'Tipo é obrigatório',
                            setValueAs: (value) => parseInt(value),
                        })}
                        disabled={isViewMode}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">Selecione o tipo do template</option>
                        {getTemplateTypeList().map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                    {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
                </div>
                <fieldset className="border rounded p-4">
                    <legend className="text-lg font-semibold">Definição do Template:</legend>
                    <hr />
                    <CustomizableTable
                        projectId={getProjectId()}
                        ref={customizableTableRef}
                        operation={isViewMode ? Operation.View : Operation.Edit}
                        onChange={(rows: CustomizableTableRows[]) => { setRows(rows) }}
                    />
                </fieldset>
                {!isViewMode && (
                    <button type="submit" className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-full flex justify-center items-center rounded-md">
                        <FiSave className="mr-2" /> Salvar
                    </button>
                )}

            </form>
        </PainelContainer>
    );
};

export default TemplateForm;