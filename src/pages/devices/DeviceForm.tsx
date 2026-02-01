import React, { useRef } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import { DeviceData, getDeviceTypeList } from '../../models/DeviceData';
import { create } from '../../services/deviceService';
import { Button, Field, Input, Select } from '../../ui';
import FormDialogBase, { FormDialogBaseExtendsRef } from '../../components/FormDialogBase';
import { useTranslation } from 'react-i18next';

interface DeviceFormProps {
  onDeviceAdded: () => void;
  variant?: "section" | "compact";
}

const DeviceForm: React.FC<DeviceFormProps> = ({ onDeviceAdded, variant = "section" }) => {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<DeviceData, 'id' | 'userId'>>();
  const dialogRef = useRef<FormDialogBaseExtendsRef>(null);
  const deviceTypes = getDeviceTypeList();

  const onSubmit: SubmitHandler<Omit<DeviceData, 'id' | 'userId'>> = async (data) => {
    const response = await create(data);
    if (response?.status === 201) {
      notifyProvider.success(t("devices.addSuccess"));
      onDeviceAdded();
      reset();
    } else {
      notifyProvider.error(t("devices.addError"));
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
            <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("devices.header")}</p>
            <h2 className="font-display text-xl text-ink">{t("devices.newTitle")}</h2>
          </div>
          <Button type="button" onClick={openForm} leadingIcon={<FiPlus />}>
            {t("common.add")}
          </Button>
        </div>
      ) : (
        <Button type="button" onClick={openForm} leadingIcon={<FiPlus />}>
          {t("devices.addButton")}
        </Button>
      )}
      <FormDialogBase
        ref={dialogRef}
        title={t("devices.newTitle")}
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
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </Select>
          </Field>
          <Field label={t("common.brandLabel")} error={errors.brand?.message as string | undefined}>
            <Input
              type="text"
              id="brand"
              {...register('brand', { required: t("common.brandRequired") })}
            />
          </Field>
          <Field label={t("common.modelLabel")} error={errors.model?.message as string | undefined}>
            <Input
              type="text"
              id="model"
              {...register('model', { required: t("common.modelRequired") })}
            />
          </Field>
          <Field label={t("common.osLabel")} error={errors.system?.message as string | undefined}>
            <Input
              type="text"
              id="system"
              {...register('system', { required: t("common.systemRequired") })}
            />
          </Field>
        </div>
      </FormDialogBase>
    </div>
  );
};

export default DeviceForm;
