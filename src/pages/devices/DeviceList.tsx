import React from 'react';
import { FiSmartphone, FiMonitor, FiTablet, FiWatch, FiTrash, FiImage, FiLayers } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import { DeviceData, getDeviceTypeDescription } from '../../models/DeviceData';
import { remove } from '../../services/deviceService';
import TitleContainer from '../../components/TitleContainer';

interface DeviceListProps {
    devices: DeviceData[];
    onDelete?: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onDelete }) => {

    const handleDelete = async (device: DeviceData) => {
        if (device.id) {
            const response = await remove(device.id);
            if (response?.status === 200) {
                notifyProvider.success("Dispositivo excluído com sucesso.");
                if (onDelete) {
                    onDelete();
                }
            } else {
                notifyProvider.error("Erro ao excluir dispositivo, tente novamente");
            }
        }
    };

    const renderDeviceIcon = (type: number) => {
        switch (type) {
            case 1:
                return <FiSmartphone className="text-purple-700 w-6 h-6" />;
            case 2:
                return <FiLayers className="text-purple-700 w-6 h-6" />;
            case 3:
                return <FiMonitor className="text-purple-700 w-6 h-6" />;
            case 4:
                return <FiTablet className="text-purple-700 w-6 h-6" />;
            case 5:
                return <FiWatch className="text-purple-700 w-6 h-6" />;
            default:
                return <FiImage className="text-purple-700 w-6 h-6" />;
        }
    };

    return (
        <div>
            <TitleContainer title="Lista de Dispositivos" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {devices.length > 0 ? (
                    devices.map(device => (
                        <div
                            key={device.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                {renderDeviceIcon(device.type)}
                                <div className="ml-3">
                                    <p className="text-lg font-bold text-purple-800">{device.model}</p>
                                    <p className="text-sm text-purple-500">Tipo: {getDeviceTypeDescription(device.type)}</p>
                                    <p className="text-sm text-purple-500">Marca: {device.brand}</p>
                                    <p className="text-sm text-purple-500">Sistema: {device.system}</p>
                                </div>
                            </div>
                            {onDelete ? (
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => handleDelete(device)}
                                    title="Excluir"
                                >
                                    <FiTrash />
                                </button>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-purple-600 col-span-full">
                        Nenhum dispositivo encontrado.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceList;