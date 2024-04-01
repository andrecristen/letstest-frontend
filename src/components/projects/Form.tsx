import React, { Fragment, useRef, useState, useImperativeHandle, ForwardedRef, RefObject } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { ProjectData } from "../../types/ProjectData"
import { createProject } from '../../services/projectService';
import FormDialogBase, { FormDialogBaseRef } from "../base/FormDialogBase"
import { getProjectVisibilityList } from "../../types/ProjectVisibilityEnum";
import notifyService from '../../services/notifyService';

const ProjectsForm = React.forwardRef<any, any>((props, ref) => {

  const formDialogRef = useRef<FormDialogBaseRef>(null);

  useImperativeHandle(ref, () => ({
    getDialogBase: () => {
      return formDialogRef;
    }
  }));

  const { register, handleSubmit } = useForm<ProjectData>()

  const onSubmit: SubmitHandler<ProjectData> = async (data) => {
    debugger;
    data.visibility =  parseInt(data.visibility.toString());
    const response = await createProject(data);
    if (response?.status == 201) {
      notifyService.success("Projeto criado com sucesso");
    } else {
      notifyService.error("Erro ao criar projeto, tente novamente");
    }
    formDialogRef.current?.closeDialog();
    window.location.reload();
  }

  return (
    <FormDialogBase ref={formDialogRef} submit={handleSubmit(onSubmit)} title="Cadastro">
      <div className="py-2">
        <input
          {...register("name")}
          required
          className="rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
          placeholder="Nome"
        />
      </div>
      <div className="py-2">
        <textarea
          {...register("description")}
          rows={5}
          required
          className="rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
          placeholder="Descrição"
        />
      </div>
      <div className="py-2">
        <select
          {...register("visibility")}
          required
          className="rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
        >
          <option value="null">Selecione a visibilidade do projeto</option>
          {getProjectVisibilityList().map((visibility) => {
            return (
              <option value={visibility.id}>{visibility.name}</option>
            );
          })}
        </select>
      </div>
    </FormDialogBase>
  )
});

export default ProjectsForm;