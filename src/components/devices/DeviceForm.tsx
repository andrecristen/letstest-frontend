import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import LoadingOverlay from '../base/LoadingOverlay';
import notifyService from '../../services/notifyService';
import { DeviceData, getDeviceTypeList } from '../../types/DeviceData';
import { create } from '../../services/deviceService';

interface DeviceFormProps {
  onDeviceAdded: () => void;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ onDeviceAdded }) => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<DeviceData, 'id' | 'userId'>>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const deviceTypes = getDeviceTypeList();

  const onSubmit: SubmitHandler<Omit<DeviceData, 'id' | 'userId'>> = async (data) => {
    setLoading(true);
    const response = await create(data);
    if (response?.status === 201) {
      notifyService.success("Dispositivo adicionado com sucesso.");
      onDeviceAdded();
      reset();
    } else {
      notifyService.error("Erro ao adicionar dispositivo, tente novamente");
    }
    setLoading(false);
  };

  const toggleForm = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="my-4">
      <LoadingOverlay show={loading} />
      <div className="flex justify-between items-center bg-purple-800 rounded-lg h-16 px-6 m-4 cursor-pointer" onClick={toggleForm}>
        <h1 className="text-2xl text-white font-bold"> Novo Dispositivo</h1>
        <button className="focus:outline-none text-white">
          {isOpen ? <FiChevronUp className="w-6 h-6" /> : <FiChevronDown className="w-6 h-6" />}
        </button>
      </div>
      {isOpen && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6 m-4 bg-white rounded-b-md shadow-md">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              id="type"
              {...register('type', {
                setValueAs: (value) => parseInt(value),
                required: 'Tipo é obrigatório'
              })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
            >
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            {errors.type && <span className="text-red-500 text-sm">{errors.type.message}</span>}
          </div>
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca</label>
            <input
              type="text"
              id="brand"
              {...register('brand', { required: 'Marca é obrigatória' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.brand ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
            />
            {errors.brand && <span className="text-red-500 text-sm">{errors.brand.message}</span>}
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Modelo</label>
            <input
              type="text"
              id="model"
              {...register('model', { required: 'Modelo é obrigatório' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.model ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
            />
            {errors.model && <span className="text-red-500 text-sm">{errors.model.message}</span>}
          </div>
          <div>
            <label htmlFor="system" className="block text-sm font-medium text-gray-700">Sistema Operacional</label>
            <input
              type="text"
              id="system"
              {...register('system', { required: 'Sistema Operacional é obrigatório' })}
              className={`mt-1 block w-full px-3 py-2 border ${errors.system ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
            />
            {errors.system && <span className="text-red-500 text-sm">{errors.system.message}</span>}
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mb-6"
          >
            Adicionar Dispositivo
          </button>
        </form>
      )}
    </div>
  );
};

export default DeviceForm;