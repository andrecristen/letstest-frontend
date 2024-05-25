import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import PainelContainer from '../base/PainelContainer';
import { FiSmartphone, FiSmile } from 'react-icons/fi';
import { UserData } from '../../types/UserData';
import { getMe } from '../../services/userService';
import LoadingOverlay from '../base/LoadingOverlay';

const ProfileEdit = () => {

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<UserData>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        load();
    }, []);

    const onSubmit: SubmitHandler<UserData> = data => {
        console.log('Perfil atualizado:', data);
    };

    const navigateTo = (route: string) => {

    };

    const load = async () => {
        const response = await getMe();
        setValue('id', response?.data.id);
        setValue('name', response?.data.name);
        setValue('email', response?.data.email);
        setValue('bio', response?.data.bio);
        setLoading(false);
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loading}/>
            <div className="mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <img
                        className="w-36 h-36 rounded-full shadow-lg"
                        src="https://via.placeholder.com/150"
                        alt="User avatar"
                    />
                </div>
                <div className="container mx-auto my-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div
                            onClick={() => navigateTo('managers')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <FiSmile className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                            <h3 className="text-center text-lg font-semibold text-purple-600">Minhas Habilidades</h3>
                        </div>

                        <div
                            onClick={() => navigateTo('testers')}
                            className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl cursor-pointer transition-shadow"
                        >
                            <FiSmartphone className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                            <h3 className="text-center text-lg font-semibold text-purple-600">Meus Dispostivos</h3>
                        </div>
                    </div>
                </div>
                <h2 className="text-2xl font-semibold text-purple-600 mt-4 text-center">Meu Perfil</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            id="name"
                            {...register('name', { required: 'Nome é obrigatório' })}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        />
                        {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            disabled
                            {...register('email', { required: 'Email é obrigatório' })}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        />
                        {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                        <textarea
                            id="bio"
                            {...register('bio')}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.bio ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        />
                        {errors.bio && <span className="text-red-500 text-sm">{errors.bio.message}</span>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Salvar
                    </button>
                </form>
            </div>
        </PainelContainer>
    );
};

export default ProfileEdit;