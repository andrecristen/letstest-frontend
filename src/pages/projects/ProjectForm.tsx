import React, { useImperativeHandle, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ProjectData } from "../../models/ProjectData";
import { createProject, updateProject } from "../../services/projectService";
import FormDialogBase, { FormDialogBaseRef, FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import { getProjectVisibilityList } from "../../models/ProjectData";
import notifyProvider from "../../infra/notifyProvider";
import { Field, Input, Select, Textarea } from "../../ui";
import { useTranslation } from "react-i18next";

interface ProjectFormProps {
  callbackSubmit?: () => void;
}

const ProjectForm = React.forwardRef<FormDialogBaseExtendsRef, ProjectFormProps>((props, ref) => {

  const { t } = useTranslation();
  const formDialogRef = useRef<FormDialogBaseRef>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<ProjectData>();
  const updateId = watch("id");

  useImperativeHandle(ref, () => ({
    openDialog: () => formDialogRef.current?.openDialog(),
    closeDialog: () => formDialogRef.current?.closeDialog(),
    setData: (data: ProjectData) => {
      reset();
      Object.keys(data).forEach((key) => {
        if (key === "dueDate") {
          const value = data.dueDate ? data.dueDate.split("T")[0] : "";
          setValue("dueDate", value as unknown as ProjectData["dueDate"]);
          return;
        }
        setValue(key as keyof ProjectData, data[key as keyof ProjectData]);
      });
    },
  }));

  const onSubmit: SubmitHandler<ProjectData> = async (data) => {
    data.visibility = parseInt(data.visibility.toString());
    try {
      if (data.id) {
        delete data.creator;
        const response = await updateProject(data);
        if (response?.status === 200) {
          notifyProvider.success(t("projects.updateSuccess"));
        } else {
          notifyProvider.error(t("projects.updateError"));
        }
      } else {
        const response = await createProject(data);
        if (response?.status === 201) {
          notifyProvider.success(t("projects.createSuccess"));
        } else {
          notifyProvider.error(t("projects.createError"));
        }
      }
    } catch (error) {
      notifyProvider.error(t("projects.processError"));
    }
    formDialogRef.current?.closeDialog();
    props.callbackSubmit?.();
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <FormDialogBase
      ref={formDialogRef}
      submit={handleSubmit(onSubmit)}
      cancel={handleCancel}
      title={updateId ? t("projects.formEditTitle") : t("projects.formCreateTitle")}
      confirmLabel={updateId ? t("projects.saveChanges") : t("projects.createProject")}
      cancelLabel={t("common.cancel")}
    >
      <div className="space-y-4">
        <Field label={t("common.nameLabel")} error={errors.name?.message as string | undefined}>
          <Input
            id="name"
            {...register("name", { required: t("common.nameRequired") })}
            placeholder={t("common.nameLabel")}
          />
        </Field>
        <Field label={t("common.descriptionLabel")} error={errors.description?.message as string | undefined}>
          <Textarea
            id="description"
            {...register("description", { required: t("common.descriptionRequired") })}
            rows={5}
            placeholder={t("common.descriptionLabel")}
          />
        </Field>
        <Field label={t("common.visibility")} error={errors.visibility?.message as string | undefined}>
          <Select
            id="visibility"
            {...register("visibility", { required: t("projects.visibilityRequired") })}
          >
            <option disabled value="">
              {t("projects.visibilityPlaceholder")}
            </option>
            {getProjectVisibilityList().map((visibility) => (
              <option key={visibility.id} value={visibility.id}>
                {visibility.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("common.dueDateLabel")}>
          <Input
            id="dueDate"
            type="date"
            {...register("dueDate", {
              setValueAs: (value) => (value ? value : null),
            })}
          />
        </Field>
      </div>
    </FormDialogBase>
  );
});

export default ProjectForm;
