import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Button, Field, Input, Select, Textarea } from "../../ui";
import { useTranslation } from 'react-i18next';

const TemplateForm = () => {
    const { t } = useTranslation();

    const customizableTableRef = useRef<CustomizableTableRef>(null);
    const [rows, setRows] = useState<CustomizableTableRows[]>([]);
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<TemplateData>();
    const [isLoadedTemplateCopy, setIsLoadedTemplateCopy] = useState<boolean>(false);
    const [loadingTemplate, setLoadingTemplate] = useState<boolean>(false);
    const { projectId, templateIdCopy } = useParams();
    const navigate = useNavigate();

    const location = useLocation();
    const isViewMode = location.pathname.includes("view");

    const loadOfCopy = useCallback(async () => {
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
    }, [templateIdCopy, isViewMode, setValue]);

    useEffect(() => {
        if (!isLoadedTemplateCopy) {
            loadOfCopy();
        }
    }, [isLoadedTemplateCopy, loadOfCopy]);

    function getProjectId(): number {
        return parseInt(projectId ? projectId : "0");
    }

    const onSubmit: SubmitHandler<TemplateData> = async (data, event) => {
        event?.preventDefault();
        event?.stopPropagation();
        if (event?.target?.attributes?.name?.nodeValue === "template") {
            if (!rows.length) {
                notifyProvider.error(t("templates.minRowRequired"));
                return;
            }
            data.data = Object.fromEntries(
                rows.map(item => [item.id, item])
            );
            setLoadingTemplate(true);
            const response = await create(getProjectId(), data);
            if (response?.status === 201) {
                notifyProvider.success(t("templates.createSuccess"));
                navigate(-1);
            } else {
                notifyProvider.error(t("templates.createError"));
            }
            setLoadingTemplate(false);
        }
    }

    return (
        <PainelContainer>
            <TitleContainer title={isViewMode ? t("templates.viewTitle") : t("templates.editTitle")} />
            <LoadingOverlay show={loadingTemplate} />
            <form name={'template'} onSubmit={handleSubmit(onSubmit)}>
                <div className="py-2">
                    <Field label={t("common.nameLabel")} error={errors.name?.message as string | undefined}>
                        <Input
                            {...register('name', { required: t("common.nameRequired") })}
                            disabled={isViewMode}
                            placeholder={t("common.nameLabel")}
                        />
                    </Field>
                </div>
                <div className="py-2">
                    <Field label={t("common.descriptionLabel")} error={errors.description?.message as string | undefined}>
                        <Textarea
                            {...register("description", { required: t("common.descriptionRequired") })}
                            rows={5}
                            disabled={isViewMode}
                            placeholder={t("common.descriptionLabel")}
                        />
                    </Field>
                </div>
                <div className="py-2">
                    <Field label={t("common.typeLabel")} error={errors.type?.message as string | undefined}>
                        <Select
                            {...register('type', {
                                required: t("common.typeRequired"),
                                setValueAs: (value) => parseInt(value),
                            })}
                            disabled={isViewMode}
                        >
                            <option value="">{t("templates.selectType")}</option>
                            {getTemplateTypeList().map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>
                <fieldset className="rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <legend className="px-2 text-sm font-semibold text-ink">{t("templates.definitionLegend")}</legend>
                    <CustomizableTable
                        projectId={getProjectId()}
                        ref={customizableTableRef}
                        operation={isViewMode ? Operation.View : Operation.Edit}
                        onChange={(rows: CustomizableTableRows[]) => { setRows(rows) }}
                    />
                </fieldset>
                {!isViewMode && (
                    <Button type="submit" variant="accent" size="lg" leadingIcon={<FiSave />} className="mt-6 w-full">
                        {t("common.save")}
                    </Button>
                )}

            </form>
        </PainelContainer>
    );
};

export default TemplateForm;
