import React, { useEffect, useState } from 'react';
import { FiPlusCircle, FiSave, FiTrash } from 'react-icons/fi';
import PainelContainer from '../base/PainelContainer';
import { TitleContainer } from '../base/TitleContainer';
import CustomizableRow from './CustomizableRow';
import { useNavigate, useParams } from 'react-router-dom';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TemplateData, getTemplateTypeList } from '../../types/TemplateData';
import { create } from '../../services/templatesService';
import notifyService from '../../services/notifyService';

const TemplateEditor = () => {

    const getIdRow = () => {
        return Date.now();
    }

    const [rows, setRows] = useState<{ id: number; minColumnCount: number; maxColumnCount: number; columns: any[]; }[]>([
        { id: getIdRow(), minColumnCount: 1, maxColumnCount: 6, columns: [] }
    ]);
    const { register, handleSubmit, setValue, getValues, reset } = useForm<TemplateData>();
    const { projectId, templateIdCopy } = useParams();
    const navigate = useNavigate();

    useEffect(() => {

    }, [rows]);

    const addRow = () => {
        const newRow = {
            id: getIdRow(),
            minColumnCount: 1,
            maxColumnCount: 6,
            columns: [],
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveRow = (id: number) => {
        const newRows = rows.filter((row) => row.id !== id);
        setRows(newRows);
    };

    const onSubmit: SubmitHandler<TemplateData> = async (data, event) => {
        event?.preventDefault();
        event?.stopPropagation();
        if (event?.target?.attributes?.name?.nodeValue == "template") {
            data.data = Object.fromEntries(
                rows.map(item => [item.id, item])
            );
            const response = await create(parseInt(projectId ? projectId : "0"), data);
            if (response?.status == 201) {
                notifyService.success("Template criado com sucesso");
                navigate(-1);
            } else {
                notifyService.error("Erro ao criar template, tente novamente");
            }
        }
    }

    const updateRow = (index: number, updatedColumns: any[]) => {
        const updatedRows = [...rows];
        updatedRows[index].columns = updatedColumns;
        setRows(updatedRows);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Personalizar Template" />
            <form name={'template'} onSubmit={handleSubmit(onSubmit)}>
                <div className="py-2">
                    <input
                        {...register("name")}
                        required
                        className="form-input"
                        placeholder="Nome"
                    />
                </div>
                <div className="py-2">
                    <textarea
                        {...register("description")}
                        rows={5}
                        required
                        className="form-input"
                        placeholder="Descrição"
                    />
                </div>
                <div className="py-2">
                    <select
                        {...register('type', {
                            setValueAs: (value) => parseInt(value),
                        })}
                        required
                        className="form-input"
                    >
                        <option disabled value="null">Selecione o tipo do template</option>
                        {getTemplateTypeList().map((type) => (
                            <option key={type.id} value={type.id}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>
                <fieldset>
                    <legend>Definição Template:</legend>
                    <hr />
                    <div className="pt-4">
                        {rows.map((row, index) => (
                            <div key={row.id} className="flex justify-between items-center">
                                <CustomizableRow
                                    key={`row` + row.id}
                                    minColumnCount={row.minColumnCount}
                                    maxColumnCount={row.maxColumnCount}
                                    onChange={(updatedColumns) => updateRow(index, updatedColumns)}
                                />
                                <div className="flex border border-gray-300 overflow-hidden h-12">

                                    <button
                                        type="button"
                                        onClick={() => handleRemoveRow(row.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-sm h-full"
                                    >
                                        <FiTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 w-full mt-2 flex justify-center items-center rounded-md">
                            <FiPlusCircle className="mr-2" /> Adicionar Linha
                        </button>
                    </div>
                </fieldset>
                <button type="submit" className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-full flex justify-center items-center rounded-md">
                    <FiSave className="mr-2" /> Salvar
                </button>
            </form>
        </PainelContainer>
    );
};

export default TemplateEditor;