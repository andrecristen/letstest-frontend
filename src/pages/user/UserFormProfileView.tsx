import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PainelContainer from '../../components/PainelContainer';
import { UserData } from '../../models/UserData';
import { getById } from '../../services/userService';
import LoadingOverlay from '../../components/LoadingOverlay';
import { useParams } from 'react-router-dom';
import TitleContainer from '../../components/TitleContainer';
import HabilityList from '../habilities/HabilityList';
import { HabilityData } from '../../models/HabilityData';
import { getHabilitiesByUserId, getMy } from '../../services/habilityService';
import { getDevicesByUserId } from '../../services/deviceService';
import DeviceList from '../devices/DeviceList';
import { DeviceData } from '../../models/DeviceData';

const UserFormProfileView = () => {

    const { register, setValue, formState: { errors } } = useForm<UserData>();
    const [habilities, setHabilities] = useState<HabilityData[]>([]);
    const [devices, setDevices] = useState<DeviceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { userId } = useParams();

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const responseUser = await getById(parseInt(userId || "0", 10));
        setValue('id', responseUser?.data.id);
        setValue('name', responseUser?.data.name);
        setValue('email', responseUser?.data.email);
        setValue('bio', responseUser?.data.bio);
        const responseHabilities = await getHabilitiesByUserId(parseInt(userId || "0", 10));
        setHabilities(responseHabilities?.data);
        const responseDevices = await getDevicesByUserId(parseInt(userId || "0", 10));
        setDevices(responseDevices?.data);
        setLoading(false);
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loading} />
            <TitleContainer title="Visualizar Perfil" />
            <div className="mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="flex flex-col items-center mb-6">
                    <img
                        className="w-36 h-36 rounded-full shadow-lg"
                        src="https://via.placeholder.com/150"
                        alt="User avatar"
                    />
                </div>
                <div>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                            type="text"
                            id="name"
                            disabled
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
                            disabled
                            {...register('bio')}
                            className={`mt-1 block w-full px-3 py-2 border ${errors.bio ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                        />
                        {errors.bio && <span className="text-red-500 text-sm">{errors.bio.message}</span>}
                    </div>
                </div>
            </div>
            <HabilityList habilities={habilities} />
            <DeviceList devices={devices} />
        </PainelContainer>
    );
};

export default UserFormProfileView;