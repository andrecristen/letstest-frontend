import React, { useRef, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import notifyProvider from '../../infra/notifyProvider';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../components/LoadingOverlay';
import { TagData, getTagSituationList } from '../../models/TagData';
import { createTag, getTagById, updateTag } from '../../services/tagService';
import { FiSave } from 'react-icons/fi';

const TagForm = () => {
    const { projectId, tagId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TagData>();
    const [loadingTag, setLoadingTag] = useState(false);
    const navigate = useNavigate();

    const updateId = watch('id');
    const updatedProjectId = watch('projectId');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");

    useEffect(() => {
        load();
    }, [projectId, tagId]);

    const getProjectId = () => parseInt(projectId || updatedProjectId + "", 10);
    const getTagId = () => parseInt(tagId || "0", 10);

    const load = async () => {
        if (getTagId()) {
            setLoadingTag(true);
            try {
                const response = await getTagById(getTagId());
                const tag = response?.data;
                setValue('id', tag.id);
                setValue('name', tag.name);
                setValue('commentary', tag.commentary);
                setValue('situation', tag.situation);
            } finally {
                setLoadingTag(false);
            }
        }
    };

    const onSubmit: SubmitHandler<TagData> = async (data) => {
        try {
            const response = data.id ? await updateTag(data.id, data) : await createTag(getProjectId(), data);
            const success = response?.status === 200 || response?.status === 201;
            if (success) {
                notifyProvider.success(`Campo personalizado ${data.id ? 'alterado' : 'criado'} com sucesso`);
                navigate(-1);
            } else {
                throw new Error('Erro inesperado');
            }
        } catch (error) {
            notifyProvider.error(`Erro ao ${data.id ? 'alterar' : 'criar'} Campo Personalizado, tente novamente`);
        }
    };

    return (
        <PainelContainer>
            <TitleContainer title="Campo Personalizado" />
            <LoadingOverlay show={loadingTag} />
            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
                {updateId && (
                    <div className="py-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">#</label>
                        <input
                            {...register('id')}
                            disabled
                            className="form-input"
                            placeholder="Id"
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <input
                        type="text"
                        id="name"
                        disabled={isViewMode}
                        {...register('name', { required: 'Nome é obrigatório' })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                </div>
                <div>
                    <label htmlFor="commentary" className="block text-sm font-medium text-gray-700">Comentário</label>
                    <textarea
                        id="commentary"
                        disabled={isViewMode}
                        {...register('commentary')}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.commentary ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    />
                    {errors.commentary && <span className="text-red-500 text-sm">{errors.commentary.message}</span>}
                </div>
                <div>
                    <label htmlFor="situation" className="block text-sm font-medium text-gray-700">Visibilidade</label>
                    <select
                        id="situation"
                        {...register("situation", {
                            setValueAs: (value) => parseInt(value),
                            required: "Situação é obrigatória"
                        })}
                        className={`mt-1 block w-full px-3 py-2 border ${errors.situation ? "border-red-500" : "border-gray-300"} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                    >
                        <option value="">
                            Selecione a situação do campo personalizado
                        </option>
                        {getTagSituationList().map((situation) => (
                            <option key={situation.id} value={situation.id}>
                                {situation.name}
                            </option>
                        ))}
                    </select>
                    {errors.situation && <span className="text-red-500 text-sm">{errors.situation.message}</span>}
                </div>
                {!loadingTag && !isViewMode && (
                    <button
                        type="submit"
                        className="mt-10 text-lg bg-green-500 hover:bg-green-600 text-white px-4 py-2 flex justify-center items-center rounded-md"
                    >
                        <FiSave className="mr-2" />
                        Salvar
                    </button>
                )}
            </form>
        </PainelContainer>
    );
};

export default TagForm;