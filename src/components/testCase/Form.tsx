import React, { useRef, useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { create, getById, update } from '../../services/testCaseService';
import notifyService from '../../services/notifyService';
import PainelContainer from "../base/PainelContainer";
import { TitleContainer } from "../base/TitleContainer";
import { TestCaseData } from "../../types/TestCaseData";
import { FiSave } from "react-icons/fi";
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from "../templates/CustomizableTable";
import { Operation } from "../templates/CustomizableRow";
import { TemplateData, TemplateTypeEnum } from "../../types/TemplateData";
import { getAllByProjectAndType } from "../../services/templatesService";
import { useNavigate, useParams } from "react-router-dom";

const TestCaseForm = () => {

    let { projectId, testCaseId } = useParams();

    const { register, handleSubmit, setValue, getValues, watch } = useForm<TestCaseData>()
    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const [templates, setTemplates] = useState<TemplateData[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState<boolean>(false);
    const navigate = useNavigate();

    const updateTemplate = watch("templateId");
    const updateId = watch("id");

    useEffect(() => {
        load();
    }, []);

    const getProjectId = (): number => {
        return parseInt(projectId ? projectId : "0");
    }

    const getTestCaseId = (): number => {
        return parseInt(testCaseId ? testCaseId : "0");
    }

    const load = async () => {
        if (getProjectId()) {
            setLoadingTemplates(true);
            const response = await getAllByProjectAndType(getProjectId(), TemplateTypeEnum["Definição de casos de teste"]);
            setTemplates(response?.data);
            setLoadingTemplates(false);
        } else if (getTestCaseId()) {
            const response = await getById(getTestCaseId());
            setValue("id", response?.data.id);
            setValue("name", response?.data.name);
            const newRows: CustomizableTableRows[] = Object.values(response?.data.data);
            customizableTableRef.current?.setRows(newRows);
        }
    }

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        if (!rows.length) {
            notifyService.error("Necessário ao menos uma linha para confirmação.");
            return;
        }
        data.data = Object.fromEntries(
            rows.map(item => [item.id, item])
        );
        //Apenas para uso em tela, API não precisa
        delete data.templateId;
        if (data.id) {
            const response = await update(data.id, data);
            if (response?.status == 200) {
                notifyService.success("Caso de teste alterado com sucesso");
                navigate(-1);
            } else {
                notifyService.error("Erro ao alterar Caso de teste, tente novamente");
            }
        } else {
            const response = await create(getProjectId(), data);
            if (response?.status == 201) {
                notifyService.success("Caso de teste criado com sucesso");
                navigate(-1);
            } else {
                notifyService.error("Erro ao criar Caso de teste, tente novamente");
            }
        }
    }

    const handleChangeTemplate = (event: any) => {
        const updateTemplateId = getValues("templateId");
        const template = templates.find((item) => item.id === updateTemplateId);
        if (template) {
            const newRows: CustomizableTableRows[] = Object.values(template.data);
            customizableTableRef.current?.setRows(newRows);
        } else {
            customizableTableRef.current?.setRows([]);
        }
    }

    return (
        <PainelContainer>
            <TitleContainer title="Caso de Teste" />
            <form onSubmit={handleSubmit(onSubmit)}>
                {updateId ? (
                    <div className="py-2">
                        <input
                            {...register("id")}
                            disabled={true}
                            className="form-input"
                            placeholder="Id"
                        />
                    </div>
                ) : null}
                <div className="py-2">
                    <input
                        {...register("name")}
                        required
                        className="form-input"
                        placeholder="Nome"
                    />
                </div>
                {!getTestCaseId() ? (
                    <div className="py-2">
                        <select
                            {...register("templateId", {
                                setValueAs: (value) => parseInt(value),
                                onChange: (e) => handleChangeTemplate(e),
                            })}
                            required
                            className="form-input"
                        >
                            <option value=''>Selecione o template</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
                <div className="py-2">
                    <fieldset>
                        <legend>Definição do Caso de Teste:</legend>
                        <hr />
                        {!updateTemplate && !getTestCaseId() ? (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Atenção!</strong>
                                <span className="block sm:inline"> Selecione o template desejado para preenchimento.</span>
                            </div>
                        ) : null}
                        <CustomizableTable
                            ref={customizableTableRef}
                            operation={Operation.FillIn}
                            onChange={(rows: CustomizableTableRows[]) => { setRows(rows) }}
                        />
                    </fieldset>
                </div>
                {!loadingTemplates ? (
                    <button type="submit" className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-full flex justify-center items-center rounded-md">
                        <FiSave className="mr-2" /> Salvar
                    </button>
                ) : null}

            </form>
        </PainelContainer>
    )
};

export default TestCaseForm;