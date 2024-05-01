import React, { Fragment, useRef, useState, useImperativeHandle, ForwardedRef, RefObject } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { ProjectData } from "../../types/ProjectData"
import { createProject, updateProject } from '../../services/projectService';
import FormDialogBase, { FormDialogBaseRef } from "../base/FormDialogBase"
import { getProjectVisibilityList } from "../../types/ProjectData";
import notifyService from '../../services/notifyService';
import { data } from "autoprefixer";

const ProjectsForm = React.forwardRef<any, any>((props, ref) => {

  const formDialogRef = useRef<FormDialogBaseRef>(null);
  const { register, handleSubmit, setValue, watch, reset } = useForm<ProjectData>()
  const updateId = watch('id');

  useImperativeHandle(ref, () => ({
    getDialogBase: () => {
      return formDialogRef;
    },
    setData: (data: ProjectData) => {
      reset();
      Object.keys(data).forEach((key: string) => {
        setValue(key as keyof ProjectData, data[key as keyof ProjectData]);
      });
    }
  }));

  const onSubmit: SubmitHandler<ProjectData> = async (data) => {
    data.visibility = parseInt(data.visibility.toString());
    if (data.id) {
      const response = await updateProject(data);
      if (response?.status == 200) {
        notifyService.success("Projeto alterado com sucesso");
      } else {
        notifyService.error("Erro ao alterar projeto, tente novamente");
      }
    } else {
      const response = await createProject(data);
      if (response?.status == 201) {
        notifyService.success("Projeto criado com sucesso");
      } else {
        notifyService.error("Erro ao criar projeto, tente novamente");
      }
    }
    formDialogRef.current?.closeDialog();
    props.callbackSubmit();
  }

  const handleCancel = () => {
    reset();
  }

  return (
    <FormDialogBase ref={formDialogRef} submit={handleSubmit(onSubmit)} cancel={handleCancel} title={updateId ? "Edição" : "Cadastro"}>
      <div className="py-2">
        <input
          {...register("name")}
          required
          className="form-input"
          placeholder="Nome"
        />
      </div>
      <div className="py-2">
        <textarea
          {...register("description")}
          rows={5}
          required
          className="form-input"
          placeholder="Descrição"
        />
      </div>
      <div className="py-2">
        <select
          {...register("visibility")}
          required
          className="form-input"
        >
          <option disabled value="null">Selecione a visibilidade do projeto</option>
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