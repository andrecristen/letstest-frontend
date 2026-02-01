import React, { useRef, useImperativeHandle } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { EnvironmentData } from "../../models/EnvironmentData"
import { createEnvironment, updateEnvironment } from '../../services/environmentService';
import FormDialogBase, { FormDialogBaseExtendsRef } from "../../components/FormDialogBase"
import { getEnvironmentSituationList } from "../../models/EnvironmentData";
import notifyProvider from '../../infra/notifyProvider';
import { Field, Input, Select, Textarea } from "../../ui";
import { useTranslation } from "react-i18next";

const EnvironmentForm = React.forwardRef<any, any>((props, ref) => {

    const { t } = useTranslation();
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EnvironmentData>()
    const environmentTypes = getEnvironmentSituationList();
    const updateId = watch('id');

    useImperativeHandle(ref, () => ({
        openDialog: () => formDialogRef.current?.openDialog(),
        closeDialog: () => formDialogRef.current?.closeDialog(),
        setData: (data: EnvironmentData) => {
            reset();
            Object.keys(data).forEach((key: string) => {
                setValue(key as keyof EnvironmentData, data[key as keyof EnvironmentData]);
            });
        }
    }));

    const onSubmit: SubmitHandler<EnvironmentData> = async (data) => {
        if (data.id) {
            const response = await updateEnvironment(data);
            if (response?.status === 200) {
                notifyProvider.success(t("environment.updateSuccess"));
            } else {
                notifyProvider.error(t("environment.updateError"));
            }
        } else {
            const response = await createEnvironment(props.projectId, data);
            if (response?.status === 201) {
                notifyProvider.success(t("environment.createSuccess"));
            } else {
                notifyProvider.error(t("environment.createError"));
            }
        }
        formDialogRef.current?.closeDialog();
        if (props.callbackSubmit) {
            props.callbackSubmit();
        }
    }

    const handleCancel = () => {
        reset();
    }

    return (
        <FormDialogBase
            ref={formDialogRef}
            submit={handleSubmit(onSubmit)}
            cancel={handleCancel}
            title={updateId ? t("environment.formEditTitle") : t("environment.formCreateTitle")}
            confirmLabel={updateId ? t("environment.saveChanges") : t("environment.createEnvironment")}
            cancelLabel={t("common.cancel")}
        >
            <div>
                <Field label={t("common.typeLabel")} error={errors.situation?.message as string | undefined}>
                    <Select
                        id="situation"
                        {...register('situation', {
                            setValueAs: (value) => parseInt(value),
                            required: t("environment.situationRequired")
                        })}
                    >
                        {environmentTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </Select>
                </Field>
            </div>
            <div>
                <Field label={t("common.nameLabel")} error={errors.name?.message as string | undefined}>
                    <Input
                        type="text"
                        id="name"
                        {...register('name', { required: t("common.nameRequired") })}
                    />
                </Field>
            </div>
            <div>
                <Field label={t("environment.descriptionLabel")} error={errors.description?.message as string | undefined}>
                    <Textarea
                        id="description"
                        {...register('description', { required: t("environment.descriptionRequired") })}
                    />
                </Field>
            </div>
        </FormDialogBase>
    )
});

export default EnvironmentForm;
