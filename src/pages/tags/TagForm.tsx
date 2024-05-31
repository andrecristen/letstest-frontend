import React, { useRef, useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import notifyProvider from '../../infra/notifyProvider';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import LoadingOverlay from '../../components/LoadingOverlay';
import { TagData, TagSituation, getTagSituationList } from '../../models/TagData';
import { createTag, getTagById, updateTag } from '../../services/tagService';
import { FiPlus, FiSave, FiTrash } from 'react-icons/fi';
import { TagValueData } from '../../models/TagValueData';

const TagForm = () => {
    const { projectId, tagId } = useParams();
    const { register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<TagData>();
    const [loadingTag, setLoadingTag] = useState(false);
    const [tagValues, setTagValues] = useState<TagValueData[]>([]);
    const navigate = useNavigate();

    const updateId = watch('id');
    const updatedProjectId = watch('projectId');
    const location = useLocation();
    const isViewMode = location.pathname.includes("view");
    const isAddMode = location.pathname.includes("add");

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
                setTagValues(tag.tagValues || []);
            } finally {
                setLoadingTag(false);
            }
        }
    };

    const onSubmit: SubmitHandler<TagData> = async (data) => {
        try {
            debugger;
            if (!tagValues.length) {
                notifyProvider.error("Necessário ao menos um valor criado.");
                return;
            }
            data.tagValues = tagValues;
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

    const addTagValue = () => {
        setTagValues([...tagValues, { name: '', situation: TagSituation.Ativo }]);
    };

    const removeTagValue = (index: number) => {
        setTagValues(tagValues.filter((_, i) => i !== index));
    };

    const updateTagName = (index: number, value: string) => {
        const newTagValues = [...tagValues];
        newTagValues[index].name = value;
        setTagValues(newTagValues);
    };

    const updateTagSituation = (index: number, value: number) => {
        const newTagValues = [...tagValues];
        newTagValues[index].situation = value;
        setTagValues(newTagValues);
    };

    const updateTagCommentary = (index: number, value: string) => {
        const newTagValues = [...tagValues];
        newTagValues[index].commentary = value;
        setTagValues(newTagValues);
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
                        disabled={isViewMode}
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
                <fieldset className="border rounded p-4">
                    <legend>Valores</legend>
                    <div className="flex flex-col gap-2">
                        {tagValues.map((tagValue, index) => (
                            <>
                                <div key={index} className="flex items-center gap-2">
                                    <div className="grid grid-cols-1">
                                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                                        <input
                                            type="text"
                                            value={tagValue.name}
                                            disabled={isViewMode}
                                            required={true}
                                            onChange={(e) => updateTagName(index, e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <label className="block text-sm font-medium text-gray-700">Comentário de Ajuda</label>
                                        <textarea
                                            value={tagValue.commentary || ""}
                                            disabled={isViewMode}
                                            onChange={(e) => updateTagCommentary(index, e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                        />
                                        <label className="block text-sm font-medium text-gray-700">Situação</label>
                                        <select
                                            id="situation"
                                            disabled={isViewMode}
                                            required={true}
                                            value={tagValue.situation}
                                            onChange={(e) => updateTagSituation(index, parseInt(e.target.value))}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
                                    </div>

                                    {isAddMode ? (
                                        <button
                                            type="button"
                                            onClick={() => removeTagValue(index)}
                                            className="text-red-500"
                                        >
                                            <FiTrash />
                                        </button>
                                    ) : null}

                                </div>
                                <hr className="border border-gray-400" />
                            </>
                        ))}
                    </div>
                    {!isViewMode && (
                        <button
                            type="button"
                            onClick={addTagValue}
                            className="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center"
                        >
                            <FiPlus className="mr-1" />
                            Adicionar Valor
                        </button>
                    )}
                </fieldset>
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