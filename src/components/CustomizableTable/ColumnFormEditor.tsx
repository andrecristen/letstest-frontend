import { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormDialogBase from "../FormDialogBase";
import { CustomizableTableRows } from "./CustomizableTable";
import { FileData } from "../../models/FileData";
import { TagData } from "../../models/TagData";
import { getTagsByProject } from "../../services/tagService";
import LoadingOverlay from "../LoadingOverlay";

interface EditFormProps {
    projectId?: number;
    column: Column;
    onFinish: () => void;
}

export enum ColumnType {
    Label = 'Label',
    Text = 'Texto',
    LongText = 'Texto Longo',
    Tag = 'Campo Personalizado',
    List = 'Lista',
    Table = 'Tabela',
    Empty = 'Espaço',
    File = 'Arquivo',
    MultipleFiles = 'Múltiplos Arquivos',
}

export interface Column {
    id: number;
    type: ColumnType;
    content: string | number;
    placeholder?: string;
    rows?: CustomizableTableRows[];
    files?: FileData[];
    tagId?: number;
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

const EditForm: React.FC<EditFormProps> = ({ projectId, column, onFinish }) => {

    const { register, handleSubmit, setValue, watch } = useForm<Column>();
    const [tags, setTags] = useState<TagData[]>([]);
    const [loadingTags, setLoadingTags] = useState<boolean>(false);

    const updateType = watch("type");

    useEffect(() => {
        Object.keys(column).forEach((key) => {
            setValue(key as keyof Column, column[key as keyof Column]);
        });
        loadTags();
    }, [column, setValue]);

    const loadTags = async () => {
        if (projectId) {
            setLoadingTags(true);
            try {
                const response = await getTagsByProject(projectId);
                setTags(response?.data || []);
            } catch (error) {
                console.error("Erro ao carregar tags:", error);
            } finally {
                setLoadingTags(false);
            }
        }
    };

    const callOnSubmit: SubmitHandler<Column> = async (data, event) => {
        debugger;
        event?.preventDefault();
        event?.stopPropagation();
        column.type = data.type;
        column.content = data.content;
        column.tagId = data.tagId;
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
            <LoadingOverlay show={loadingTags} />
            <div className="py-2">
                <select
                    {...register("type")}
                    required
                    className="form-input"
                >
                    <option disabled value="null">Tipo da coluna</option>
                    {getColumnTypeList().map((type) => {
                        return (
                            <option key={'columnType' + type.id} value={type.id}>{type.id}</option>
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
            {updateType == ColumnType.Tag ? (
                <div className="py-2">
                    <select
                        {...register("tagId", { setValueAs: (value) => parseInt(value) })}
                        required
                        className="form-input"
                    >
                        <option value="">Selecione o campo personalizado</option>
                        {tags.map((tag) => {
                            return (
                                <option key={'tag' + tag.id} value={tag.id}>{tag.name}</option>
                            );
                        })}
                    </select>
                </div>
            ) : null}

        </FormDialogBase>
    );
};

export default EditForm;