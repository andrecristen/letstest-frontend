import React, { useCallback, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import notifyProvider from '../../infra/notifyProvider';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../components/LoadingOverlay';
import { TagData, TagSituation, getTagSituationList } from '../../models/TagData';
import { createTag, getTagById, updateTag } from '../../services/tagService';
import { FiPlus, FiSave, FiTrash } from 'react-icons/fi';
import { TagValueData } from '../../models/TagValueData';
import { Button, Field, Input, Select, Textarea } from '../../ui';
import { useTranslation } from 'react-i18next';

const TagForm = () => {
    const { t } = useTranslation();
    const { projectId, tagId } = useParams();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TagData>();
    const [loadingTag, setLoadingTag] = useState(false);
    const [tagValues, setTagValues] = useState<TagValueData[]>([]);
    const navigate = useNavigate();

    const updateId = watch('id');
    const updatedProjectId = watch('projectId');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");
    const isAddMode = location.pathname.includes("add");

    const getProjectId = () => parseInt(projectId || updatedProjectId + "", 10);

    const load = useCallback(async () => {
        const tagNumericId = parseInt(tagId || "0", 10);
        if (tagNumericId) {
            setLoadingTag(true);
            try {
                const response = await getTagById(tagNumericId);
                const tag = response?.data;
                setValue('id', tag.id);
                setValue('name', tag.name);
                setValue('commentary', tag.commentary);
                setValue('situation', tag.situation);
                setTagValues(tag.tagValues || []);
            } finally {
                setLoadingTag(false);
            }
        }
    }, [tagId, setValue]);

    useEffect(() => {
        load();
    }, [load]);

    const onSubmit: SubmitHandler<TagData> = async (data) => {
        try {
            setLoadingTag(true);
            if (!tagValues.length) {
                notifyProvider.error(t("tags.minValueRequired"));
                return;
            }
            data.tagValues = tagValues;
            const response = data.id ? await updateTag(data.id, data) : await createTag(getProjectId(), data);
            const success = response?.status === 200 || response?.status === 201;
            if (success) {
                const actionResult = data.id ? t("common.updatedResult") : t("common.createdResult");
                notifyProvider.success(t("tags.saveSuccess", { action: actionResult }));
                navigate(-1);
            } else {
                throw new Error(t("tags.unexpectedError"));
            }
        } catch (error) {
            const action = data.id ? t("common.updatedAction") : t("common.createdAction");
            notifyProvider.error(t("tags.saveError", { action }));
        } finally {
            setLoadingTag(false);
        }
    };

    const addTagValue = () => {
        setTagValues([...tagValues, { name: '', situation: TagSituation.Ativo }]);
    };

    const removeTagValue = (index: number) => {
        setTagValues(tagValues.filter((_, i) => i !== index));
    };

    const updateTagName = (index: number, value: string) => {
        const newTagValues = [...tagValues];
        newTagValues[index].name = value;
        setTagValues(newTagValues);
    };

    const updateTagSituation = (index: number, value: number) => {
        const newTagValues = [...tagValues];
        newTagValues[index].situation = value;
        setTagValues(newTagValues);
    };

    const updateTagCommentary = (index: number, value: string) => {
        const newTagValues = [...tagValues];
        newTagValues[index].commentary = value;
        setTagValues(newTagValues);
    };

    return (
        <PainelContainer>
            <TitleContainer title={t("tags.formTitle")} />
            <LoadingOverlay show={loadingTag} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <div className="py-2">
                        <Field label="#">
                            <Input
                                {...register('id')}
                                disabled
                                placeholder={t("common.idLabel")}
                            />
                        </Field>
                    </div>
                )}
                <div>
                    <Field label={t("common.nameLabel")} error={errors.name?.message as string | undefined}>
                        <Input
                            type="text"
                            id="name"
                            disabled={isViewMode}
                            {...register('name', { required: t("common.nameRequired") })}
                        />
                    </Field>
                </div>
                <div>
                    <Field label={t("tags.commentLabel")} error={errors.commentary?.message as string | undefined}>
                        <Textarea
                            id="commentary"
                            disabled={isViewMode}
                            {...register('commentary')}
                        />
                    </Field>
                </div>
                <div>
                    <Field label={t("tags.visibilityLabel")} error={errors.situation?.message as string | undefined}>
                        <Select
                            id="situation"
                            disabled={isViewMode}
                            {...register("situation", {
                                setValueAs: (value) => parseInt(value),
                                required: t("tags.visibilityRequired")
                            })}
                        >
                            <option value="">
                                {t("tags.selectSituation")}
                            </option>
                            {getTagSituationList().map((situation) => (
                                <option key={situation.id} value={situation.id}>
                                    {situation.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>
                <fieldset className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <legend className="px-2 text-sm font-semibold text-ink">{t("common.values")}</legend>
                    <div className="flex flex-col gap-2">
                        {tagValues.map((tagValue, index) => (
                            <>
                                <div key={index} className="flex items-center gap-2">
                                    <div className="grid w-full grid-cols-1 gap-3">
                                        <Field label={t("common.nameLabel")}>
                                            <Input
                                                type="text"
                                                value={tagValue.name}
                                                disabled={isViewMode}
                                                required={true}
                                                onChange={(e) => updateTagName(index, e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t("tags.helpCommentaryLabel")}>
                                            <Textarea
                                                value={tagValue.commentary || ""}
                                                disabled={isViewMode}
                                                onChange={(e) => updateTagCommentary(index, e.target.value)}
                                            />
                                        </Field>
                                        <Field label={t("common.status")}>
                                            <Select
                                                id="situation"
                                                disabled={isViewMode}
                                                required={true}
                                                value={tagValue.situation}
                                                onChange={(e) => updateTagSituation(index, parseInt(e.target.value))}
                                            >
                                                <option value="">
                                                    {t("tags.selectSituation")}
                                                </option>
                                                {getTagSituationList().map((situation) => (
                                                    <option key={situation.id} value={situation.id}>
                                                        {situation.name}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Field>
                                    </div>

                                    {isAddMode ? (
                                        <Button
                                            type="button"
                                            onClick={() => removeTagValue(index)}
                                            variant="danger"
                                            size="sm"
                                            leadingIcon={<FiTrash />}
                                        >
                                            {t("common.remove")}
                                        </Button>
                                    ) : null}

                                </div>
                                <hr className="border border-ink/10" />
                            </>
                        ))}
                    </div>
                    {!isViewMode && (
                        <Button
                            type="button"
                            onClick={addTagValue}
                            variant="outline"
                            size="sm"
                            leadingIcon={<FiPlus />}
                        >
                            {t("tags.addValue")}
                        </Button>
                    )}
                </fieldset>
                {!loadingTag && !isViewMode && (
                    <Button
                        type="submit"
                        variant="accent"
                        size="lg"
                        leadingIcon={<FiSave />}
                        className="mt-6"
                    >
                        {t("common.save")}
                    </Button>
                )}
            </form>
        </PainelContainer>
    );
};

export default TagForm;
