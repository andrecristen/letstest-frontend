import { useCallback, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import FormDialogBase from "../FormDialogBase";
import { CustomizableTableRows } from "./CustomizableTable";
import { FileData } from "../../models/FileData";
import { TagData } from "../../models/TagData";
import { getTagsByProject } from "../../services/tagService";
import LoadingOverlay from "../LoadingOverlay";
import { useTranslation } from "react-i18next";
import { Field, Input, Select, Textarea } from "../../ui";

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

const COLUMN_TYPE_ORDER: ColumnType[] = [
    ColumnType.Text,
    ColumnType.LongText,
    ColumnType.Label,
    ColumnType.Tag,
    ColumnType.File,
    ColumnType.MultipleFiles,
    ColumnType.List,
    ColumnType.Table,
    ColumnType.Empty,
];

const COLUMN_TYPE_LABEL_KEYS: Record<ColumnType, string> = {
    [ColumnType.Label]: "customTable.columnTypes.label",
    [ColumnType.Text]: "customTable.columnTypes.text",
    [ColumnType.LongText]: "customTable.columnTypes.longText",
    [ColumnType.Tag]: "customTable.columnTypes.tag",
    [ColumnType.List]: "customTable.columnTypes.list",
    [ColumnType.Table]: "customTable.columnTypes.table",
    [ColumnType.Empty]: "customTable.columnTypes.empty",
    [ColumnType.File]: "customTable.columnTypes.file",
    [ColumnType.MultipleFiles]: "customTable.columnTypes.multipleFiles",
};

const EditForm: React.FC<EditFormProps> = ({ projectId, column, onFinish }) => {
    const { t } = useTranslation();

    const { register, handleSubmit, setValue, watch } = useForm<Column>();
    const [tags, setTags] = useState<TagData[]>([]);
    const [loadingTags, setLoadingTags] = useState<boolean>(false);

    const updateType = watch("type");
    const columnTypeOptions = COLUMN_TYPE_ORDER.map((type) => ({
        id: type,
        label: t(COLUMN_TYPE_LABEL_KEYS[type]),
    }));

    const loadTags = useCallback(async () => {
        if (projectId) {
            setLoadingTags(true);
            try {
                const response = await getTagsByProject(projectId, 1, 200);
                setTags(response?.data?.data || []);
            } catch (error) {
            console.error(t("customTable.loadTagsError"), error);
            } finally {
                setLoadingTags(false);
            }
        }
    }, [projectId, t]);

    useEffect(() => {
        Object.keys(column).forEach((key) => {
            setValue(key as keyof Column, column[key as keyof Column]);
        });
        loadTags();
    }, [column, loadTags, setValue]);

    const callOnSubmit: SubmitHandler<Column> = async (data, event) => {
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
            title={t("customTable.editColumnTitle")}
            modalClassName="max-w-2xl"
        >
            <LoadingOverlay show={loadingTags} />
            <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("customTable.typeLabel")}>
                    <Select {...register("type")} required>
                        <option value="" disabled>
                            {t("common.columnType")}
                        </option>
                        {columnTypeOptions.map((type) => (
                            <option key={`columnType${type.id}`} value={type.id}>
                                {type.label}
                            </option>
                        ))}
                    </Select>
                </Field>
                <div className="rounded-2xl border border-ink/10 bg-ink/5 p-4 text-sm text-ink/70">
                    <p className="font-semibold text-ink">{t("customTable.typeHelpTitle")}</p>
                    <p className="mt-1 text-xs text-ink/60">{t("customTable.typeHelpDescription")}</p>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {TYPES_CONTENT_EDIT.some((columnType) => columnType === updateType) ? (
                    <Field label={t("customTable.contentLabel")}>
                        <Input
                            {...register("content")}
                            required={TYPES_CONTENT_EDIT_REQUIRED.some((columnType) => columnType === updateType)}
                            placeholder={t("customTable.contentPlaceholder")}
                        />
                    </Field>
                ) : null}
                {TYPES_CONTENT_PLACEHOLDER.some((columnType) => columnType === updateType) ? (
                    <Field label={t("customTable.placeholderLabel")}>
                        <Input
                            {...register("placeholder")}
                            placeholder={t("customTable.helpTextPlaceholder")}
                        />
                    </Field>
                ) : null}
                {updateType === ColumnType.Tag ? (
                    <Field label={t("customTable.tagLabel")}>
                        <Select
                            {...register("tagId", { setValueAs: (value) => parseInt(value, 10) })}
                            required
                        >
                            <option value="">{t("common.selectCustomField")}</option>
                            {tags.map((tag) => (
                                <option key={`tag${tag.id}`} value={tag.id}>
                                    {tag.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                ) : null}
                {updateType === ColumnType.LongText ? (
                    <Field label={t("customTable.previewLabel")} hint={t("customTable.previewHint")}>
                        <Textarea
                            value={String(watch("content") ?? "")}
                            placeholder={t("customTable.fillPlaceholder")}
                            disabled
                        />
                    </Field>
                ) : null}
            </div>

        </FormDialogBase>
    );
};

export default EditForm;
