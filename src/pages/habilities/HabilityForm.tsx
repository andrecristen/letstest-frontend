import React, { useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import { HabilityData, getHabilityTypeList } from '../../models/HabilityData';
import { create } from '../../services/habilityService';
import { Button, Field, Input, Select } from '../../ui';
import FormDialogBase, { FormDialogBaseExtendsRef } from '../../components/FormDialogBase';
import { useTranslation } from 'react-i18next';

interface HabilityFormProps {
    onHabilityAdded: () => void;
    variant?: "section" | "compact";
}

const HabilityForm: React.FC<HabilityFormProps> = ({ onHabilityAdded, variant = "section" }) => {

    const { t } = useTranslation();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<HabilityData, 'id' | 'userId'>>();
    const dialogRef = useRef<FormDialogBaseExtendsRef>(null);
    const habilityTypes = getHabilityTypeList();

    const onSubmit: SubmitHandler<Omit<HabilityData, 'id' | 'userId'>> = async (data) => {
        const response = await create(data);
        if (response?.status === 201) {
            notifyProvider.success(t("habilities.addSuccess"));
            onHabilityAdded();
            reset();
        } else {
            notifyProvider.error(t("habilities.addError"));
        }
    };

    const openForm = () => dialogRef.current?.openDialog();
    const closeForm = () => {
        dialogRef.current?.closeDialog();
        reset();
    };

    return (
        <div className={variant === "section" ? "space-y-4" : ""}>
            {variant === "section" ? (
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("habilities.header")}</p>
                        <h2 className="font-display text-xl text-ink">{t("habilities.newTitle")}</h2>
                    </div>
                    <Button type="button" onClick={openForm} leadingIcon={<FiPlus />}>
                        {t("common.add")}
                    </Button>
                </div>
            ) : (
                <Button type="button" onClick={openForm} leadingIcon={<FiPlus />}>
                    {t("habilities.addButton")}
                </Button>
            )}
            <FormDialogBase
                ref={dialogRef}
                title={t("habilities.newTitle")}
                submit={handleSubmit(async (data) => {
                    await onSubmit(data);
                    closeForm();
                })}
                cancel={closeForm}
                confirmLabel={t("common.add")}
            >
                <div className="space-y-4">
                    <Field label={t("common.typeLabel")} error={errors.type?.message as string | undefined}>
                        <Select
                            id="type"
                            {...register('type', {
                                setValueAs: (value) => parseInt(value),
                                required: t("common.typeRequired")
                            })}
                        >
                            {habilityTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </Select>
                    </Field>
                    <Field label={t("habilities.descriptionLabel")} error={errors.value?.message as string | undefined}>
                        <Input
                            type="text"
                            id="value"
                            {...register('value', { required: t("habilities.descriptionRequired") })}
                        />
                    </Field>
                </div>
            </FormDialogBase>
        </div>
    );
};

export default HabilityForm;
