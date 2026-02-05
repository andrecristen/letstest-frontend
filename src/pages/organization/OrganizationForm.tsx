import React, { useImperativeHandle, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import FormDialogBase, { FormDialogBaseExtendsRef, FormDialogBaseRef } from "../../components/FormDialogBase";
import { Field, Input } from "../../ui";
import notifyProvider from "../../infra/notifyProvider";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as organizationService from "../../services/organizationService";

type OrganizationFormData = {
  name: string;
};

interface OrganizationFormProps {
  callbackSubmit?: () => void;
}

const OrganizationForm = React.forwardRef<FormDialogBaseExtendsRef, OrganizationFormProps>((props, ref) => {
  const { t } = useTranslation();
  const formDialogRef = useRef<FormDialogBaseRef>(null);
  const { refreshOrganizations } = useOrganization();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrganizationFormData>();

  useImperativeHandle(ref, () => ({
    openDialog: () => formDialogRef.current?.openDialog(),
    closeDialog: () => formDialogRef.current?.closeDialog(),
    setData: () => {
      reset();
    },
  }));

  const onSubmit: SubmitHandler<OrganizationFormData> = async (data) => {
    try {
      const response = await organizationService.create(data.name.trim());
      if (response?.status === 201) {
        notifyProvider.success(t("organization.createSuccess"));
        await refreshOrganizations();
        props.callbackSubmit?.();
        formDialogRef.current?.closeDialog();
      } else {
        notifyProvider.error(t("organization.createError"));
      }
    } catch (error: any) {
      notifyProvider.error(error?.response?.data?.error || t("organization.createError"));
    }
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <FormDialogBase
      ref={formDialogRef}
      submit={handleSubmit(onSubmit)}
      cancel={handleCancel}
      title={t("organization.createNewTitle")}
      confirmLabel={t("common.create")}
      cancelLabel={t("common.cancel")}
    >
      <div className="space-y-4">
        <Field label={t("organization.name")} error={errors.name?.message as string | undefined}>
          <Input
            id="name"
            {...register("name", { required: t("common.nameRequired") })}
            placeholder={t("organization.namePlaceholder")}
          />
        </Field>
      </div>
    </FormDialogBase>
  );
});

export default OrganizationForm;
