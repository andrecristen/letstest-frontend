import React from 'react';
import { FiTrash, FiStar, FiSmile, FiGlobe, FiFile, FiBookOpen, FiAward } from 'react-icons/fi';
import notifyService from '../../services/notifyService';
import { HabilityData, getHabilityTypeDescription } from '../../types/HabilityData';
import { remove } from '../../services/habilityService';
import TitleContainer from '../base/TitleContainer';

interface HabilityListProps {
    habilities: HabilityData[];
    onDelete?: () => void;
}

const HabilityList: React.FC<HabilityListProps> = ({ habilities, onDelete }) => {

    const handleDelete = async (hability: HabilityData) => {
        if (hability.id) {
            const response = await remove(hability.id);
            if (response?.status === 200) {
                notifyService.success("Habilidade excluída com sucesso.");
                if (onDelete) {
                    onDelete();
                }
            } else {
                notifyService.error("Erro ao excluir habilidade, tente novamente");
            }
        }
    };

    const renderHabilityIcon = (type: number) => {
        switch (type) {
            case 1:
                return <FiStar className="text-purple-700 w-6 h-6" />;
            case 2:
                return <FiFile className="text-purple-700 w-6 h-6" />;
            case 3:
                return <FiBookOpen className="text-purple-700 w-6 h-6" />;
            case 4:
                return <FiGlobe className="text-purple-700 w-6 h-6" />;
            case 5:
                return <FiAward className="text-purple-700 w-6 h-6" />;
            default:
                return <FiSmile className="text-purple-700 w-6 h-6" />;
        }
    };

    return (
        <div>
            <TitleContainer title="Lista de Habilidades" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {habilities.length > 0 ? (
                    habilities.map(hability => (
                        <div
                            key={hability.id}
                            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 flex justify-between items-center"
                        >
                            <div className="flex items-center">
                                {renderHabilityIcon(hability.type)}
                                <div className="ml-3">
                                    <p className="text-lg font-bold text-purple-800">{hability.value}</p>
                                    <p className="text-sm text-purple-500">Tipo: {getHabilityTypeDescription(hability.type)}</p>
                                </div>
                            </div>
                            {onDelete ? (
                                <button
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => handleDelete(hability)}
                                    title="Excluir"
                                >
                                    <FiTrash />
                                </button>
                            ) : null}
                        </div>
                    ))
                ) : (
                    <div className="text-center text-purple-600 col-span-full">
                        Nenhuma habilidade encontrada.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabilityList;
