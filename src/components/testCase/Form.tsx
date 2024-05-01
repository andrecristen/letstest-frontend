import React, { Fragment, useRef, useState, useImperativeHandle, ForwardedRef, RefObject } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { create, update } from '../../services/testCaseService';
import notifyService from '../../services/notifyService';
import PainelContainer from "../base/PainelContainer";
import { TitleContainer } from "../base/TitleContainer";
import { TestCaseData } from "../../types/TestCaseData";
import { FiSave } from "react-icons/fi";
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from "../templates/CustomizableTable";
import { Operation } from "../templates/CustomizableRow";

const TestCaseForm = () => {

    const { register, handleSubmit, setValue, getValues, reset } = useForm<TestCaseData>()
    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);

    const onSubmit: SubmitHandler<TestCaseData> = async (data) => {
        if (data.id) {
            const response = await update(data.id, data);
            if (response?.status == 200) {
                notifyService.success("Caso de teste alterado com sucesso");
            } else {
                notifyService.error("Erro ao alterar Caso de teste, tente novamente");
            }
        } else {
            const response = await create(data.id, data);
            if (response?.status == 201) {
                notifyService.success("Caso de teste criado com sucesso");
            } else {
                notifyService.error("Erro ao criar Caso de teste, tente novamente");
            }
        }
    }

    return (
        <PainelContainer>
            <TitleContainer title="Caso de Teste" />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="py-2">
                    <input
                        {...register("name")}
                        required
                        className="form-input"
                        placeholder="Nome"
                    />
                </div>
                <div className="py-2">
                    <fieldset>
                        <legend>Definição do Caso de Teste:</legend>
                        <hr />
                        <CustomizableTable
                            ref={customizableTableRef}
                            operation={Operation.FillIn}
                            onChange={(rows: CustomizableTableRows[]) => { setRows(rows) }}
                        />
                    </fieldset>
                </div>
                <button type="submit" className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-full flex justify-center items-center rounded-md">
                    <FiSave className="mr-2" /> Salvar
                </button>
            </form>
        </PainelContainer>
    )
};

export default TestCaseForm;