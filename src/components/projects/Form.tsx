import React, { Fragment, useRef, useState, useImperativeHandle, ForwardedRef, RefObject } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { ProjectData } from "../../types/ProjectData"
import { createProject, updateProject } from '../../services/projectService';
import FormDialogBase, { FormDialogBaseRef } from "../base/FormDialogBase"
import { getProjectVisibilityList } from "../../types/ProjectVisibilityEnum";
import notifyService from '../../services/notifyService';
import { ProjectSituationEnum, getProjectSituationList } from "../../types/ProjectSituationEnum";

const ProjectsForm = React.forwardRef<any, any>((props, ref) => {

  const formDialogRef = useRef<FormDialogBaseRef>(null);
  const { register, handleSubmit, setValue, getValues, reset } = useForm<ProjectData>()

  useImperativeHandle(ref, () => ({
    getDialogBase: () => {
      return formDialogRef;
    },
    setData: (data: ProjectData) => {
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
  }

  const handleCancel = () => {
    console.log(getValues()["id"]);
    reset();
  }

  return (
    <FormDialogBase ref={formDialogRef} submit={handleSubmit(onSubmit)} cancel={handleCancel} title="Cadastro">
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
      <div hidden={getValues()["id"] == undefined }className="py-2">
        <select
          {...register("situation")}
          required
          className="form-input"
        >
          <option disabled value="null">Selecione a situação do projeto</option>
          {getProjectSituationList().map((situation) => {
            return (
              <option value={situation.id ? situation.id : ProjectSituationEnum.Testando} >{situation.name}</option>
            );
          })}
        </select>
      </div>
    </FormDialogBase>
  )
});

export default ProjectsForm;