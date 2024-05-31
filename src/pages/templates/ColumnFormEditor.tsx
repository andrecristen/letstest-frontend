import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormDialogBase from "../../components/FormDialogBase";
import { CustomizableTableRows } from "./CustomizableTable";
import { FileData } from "../../models/FileData";

interface EditFormProps {
    column: Column;
    onFinish: () => void;
}

export enum ColumnType {
    Label = 'Label',
    Text = 'Texto',
    LongText = 'Texto Longo',
    List = 'Lista',
    Table = 'Tabela',
    Empty = 'Espaço',
    File = 'Arquivo',
    MultipleFiles = 'Múltiplos Arquivos',
}

export interface Column {
    id: number;
    type: ColumnType;
    content: string;
    placeholder?: string;
    rows?: CustomizableTableRows[];
    files?: FileData[];
}

const TYPES_CONTENT_EDIT = [
    ColumnType.Text,
    ColumnType.LongText,
    ColumnType.Label
]

const TYPES_CONTENT_PLACEHOLDER = [
    ColumnType.Text,
    ColumnType.LongText,
]

const TYPES_CONTENT_EDIT_REQUIRED = [
    ColumnType.Label
]

export const getColumnTypeList = () => {
    return Object.keys(ColumnType)
        .filter(key => isNaN(Number(key)))
        .map(key => ({ name: key, id: ColumnType[key as keyof typeof ColumnType] }));
}

const EditForm: React.FC<EditFormProps> = ({ column, onFinish }) => {

    const { register, handleSubmit, setValue, watch } = useForm<Column>();

    const updateType = watch("type");

    useEffect(() => {
        Object.keys(column).forEach((key) => {
            setValue(key as keyof Column, column[key as keyof Column]);
        });
    }, [column, setValue]);

    const callOnSubmit: SubmitHandler<Column> = async (data, event) => {
        event?.preventDefault();
        event?.stopPropagation();
        column.type = data.type;
        column.content = data.content;
        column.placeholder = data.placeholder;
        onFinish();
    };

    return (
        <FormDialogBase
            initialOpen={true}
            submit={handleSubmit(callOnSubmit)}
            cancel={onFinish}
            title="Editar Coluna"
        >
            <div className="py-2">
                <select
                    {...register("type")}
                    required
                    className="form-input"
                >
                    <option disabled value="null">Tipo da coluna</option>
                    {getColumnTypeList().map((type) => {
                        return (
                            <option value={type.id}>{type.id}</option>
                        );
                    })}
                </select>
            </div>
            {TYPES_CONTENT_EDIT.some((columnType) => columnType == updateType) ? (
                <div className="py-2">
                    <input
                        {...register("content")}
                        required={TYPES_CONTENT_EDIT_REQUIRED.some((columnType) => columnType == updateType)}
                        className="form-input"
                        placeholder="Conteúdo"
                    />
                </div>
            ) : null}
            {TYPES_CONTENT_PLACEHOLDER.some((columnType) => columnType == updateType) ? (
                <div className="py-2">
                    <input
                        {...register("placeholder")}
                        className="form-input"
                        placeholder="Texto de Ajuda"
                    />
                </div>
            ) : null}

        </FormDialogBase>
    );
};

export default EditForm;