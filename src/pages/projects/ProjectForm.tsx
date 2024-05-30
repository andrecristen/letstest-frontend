import React, { useImperativeHandle, useRef } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ProjectData } from "../../models/ProjectData";
import { createProject, updateProject } from "../../services/projectService";
import FormDialogBase, { FormDialogBaseRef, FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import { getProjectVisibilityList } from "../../models/ProjectData";
import notifyProvider from "../../infra/notifyProvider";

interface ProjectFormProps {
  callbackSubmit?: () => void;
}

const ProjectForm = React.forwardRef<FormDialogBaseExtendsRef, ProjectFormProps>((props, ref) => {

  const formDialogRef = useRef<FormDialogBaseRef>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<ProjectData>();
  const updateId = watch("id");

  useImperativeHandle(ref, () => ({
    openDialog: () => formDialogRef.current?.openDialog(),
    closeDialog: () => formDialogRef.current?.closeDialog(),
    setData: (data: ProjectData) => {
      reset();
      Object.keys(data).forEach((key) => {
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
          notifyProvider.success("Projeto alterado com sucesso");
        } else {
          notifyProvider.error("Erro ao alterar projeto, tente novamente");
        }
      } else {
        const response = await createProject(data);
        if (response?.status === 201) {
          notifyProvider.success("Projeto criado com sucesso");
        } else {
          notifyProvider.error("Erro ao criar projeto, tente novamente");
        }
      }
    } catch (error) {
      notifyProvider.error("Erro ao processar solicitação, tente novamente");
    }
    formDialogRef.current?.closeDialog();
    props.callbackSubmit?.();
  };

  const handleCancel = () => {
    reset();
  };

  return (
    <FormDialogBase ref={formDialogRef} submit={handleSubmit(onSubmit)} cancel={handleCancel} title={updateId ? "Edição" : "Cadastro"}>
      <div className="py-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
        <input
          id="name"
          {...register("name", { required: "Nome é obrigatório" })}
          className={`mt-1 block w-full px-3 py-2 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
          placeholder="Nome"
        />
        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
      </div>
      <div className="py-2">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
        <textarea
          id="description"
          {...register("description", { required: "Descrição é obrigatória" })}
          rows={5}
          className={`mt-1 block w-full px-3 py-2 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
          placeholder="Descrição"
        />
        {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
      </div>
      <div className="py-2">
        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibilidade</label>
        <select
          id="visibility"
          {...register("visibility", { required: "Visibilidade é obrigatória" })}
          className={`mt-1 block w-full px-3 py-2 border ${errors.visibility ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
        >
          <option disabled value="">
            Selecione a visibilidade do projeto
          </option>
          {getProjectVisibilityList().map((visibility) => (
            <option key={visibility.id} value={visibility.id}>
              {visibility.name}
            </option>
          ))}
        </select>
        {errors.visibility && <span className="text-red-500 text-sm">{errors.visibility.message}</span>}
      </div>
    </FormDialogBase>
  );
});

export default ProjectForm;