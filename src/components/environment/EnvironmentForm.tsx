import React, { Fragment, useRef, useState, useImperativeHandle, ForwardedRef, RefObject } from "react";
import { useForm, SubmitHandler } from "react-hook-form"
import { EnvironmentData } from "../../types/EnvironmentData"
import { createEnvironment, updateEnvironment } from '../../services/environmentService';
import FormDialogBase, { FormDialogBaseRef } from "../base/FormDialogBase"
import { getEnvironmentSituationList } from "../../types/EnvironmentData";
import notifyService from '../../services/notifyService';

const EnvironmentForm = React.forwardRef<any, any>((props, ref) => {

    const formDialogRef = useRef<FormDialogBaseRef>(null);
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EnvironmentData>()
    const environmentTypes = getEnvironmentSituationList();
    const updateId = watch('id');

    useImperativeHandle(ref, () => ({
        getDialogBase: () => {
            return formDialogRef;
        },
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
            if (response?.status == 200) {
                notifyService.success("Ambiente alterado com sucesso");
            } else {
                notifyService.error("Erro ao alterar ambiente, tente novamente");
            }
        } else {
            const response = await createEnvironment(props.projectId, data);
            if (response?.status == 201) {
                notifyService.success("Ambiente criado com sucesso");
            } else {
                notifyService.error("Erro ao criar ambiente, tente novamente");
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
        <FormDialogBase ref={formDialogRef} submit={handleSubmit(onSubmit)} cancel={handleCancel} title={updateId ? "Edição" : "Cadastro"}>
            <div>
                <label htmlFor="situation" className="block text-sm font-medium text-gray-700">Tipo</label>
                <select
                    id="situation"
                    {...register('situation', {
                        setValueAs: (value) => parseInt(value),
                        required: 'Situação é obrigatória'
                    })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.situation ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                >
                    {environmentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                </select>
                {errors.situation && <span className="text-red-500 text-sm">{errors.situation.message}</span>}
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Nome é obrigatório' })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                />
                {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição/Acesso</label>
                <textarea
                    id="description"
                    {...register('description', { required: 'Descrição/Acesso é obrigatória' })}
                    className={`mt-1 block w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                />
                {errors.description && <span className="text-red-500 text-sm">{errors.description.message}</span>}
            </div>
        </FormDialogBase>
    )
});

export default EnvironmentForm;