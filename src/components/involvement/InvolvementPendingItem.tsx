import React from "react";
import { FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { accept, reject, remove } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum, getInvolvementTypeDescription } from "../../types/InvolvementData";
import { getProjectSituationColor, getProjectSituationDescription } from '../../types/ProjectData';
import logo from '../../assets/logo-transparente.png';
import notifyService from "../../services/notifyService";

interface InvolvementPendingItemProps {
    involvement: InvolvementData;
    typeSituation: InvolvementSituationEnum;
    callback: () => void;
}

const InvolvementPendingItem: React.FC<InvolvementPendingItemProps> = ({ involvement, typeSituation, callback }) => {

    const navigate = useNavigate();

    const handleClickProfileUser = () => {
        navigate("/profile/" + involvement.project?.creator?.id);
    }

    const handleClickAccept = async () => {
        const response = await accept(involvement.id);
        if (response?.status !== 200) {
            notifyService.error("Erro ao aceitar envolvimento com o projeto.");
        } else {
            callback();
        }
    }

    const handleClickReject = async () => {
        const response = await reject(involvement.id);
        if (response?.status !== 200) {
            notifyService.error("Erro ao rejeitar envolvimento com o projeto.");
        } else {
            callback();
        }
    }

    const handleClickRemove = async () => {
        const response = await remove(involvement.id);
        if (response?.status !== 200) {
            notifyService.error("Erro ao remover envolvimento com o projeto.");
        } else {
            callback();
        }
    }

    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <div className="ml-3">
                    <div className="flex items-center text-xs">
                        <span
                            className={`bg-${getProjectSituationColor(
                                involvement.project?.situation || 0
                            )} text-white relative z-10 rounded-full px-3 py-1.5 font-medium`}
                        >
                            {getProjectSituationDescription(involvement.project?.situation || 0)}
                        </span>
                    </div>
                    <div className="group relative">
                        <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                            #{involvement.project?.id} - {involvement.project?.name}
                        </h3>
                        <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                            Tipo: {getInvolvementTypeDescription(involvement.type)}
                        </h3>
                        <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{involvement.project?.description}</p>
                    </div>
                    <div className="relative mt-8 flex items-center gap-x-4">
                        <img src={logo} alt="Logo" className="h-10 w-10 rounded-full bg-gray-50" />
                        <div className="text-sm leading-6">
                            <p className="font-semibold text-gray-900">
                                <a href="" className="border-b border-purple-400" onClick={handleClickProfileUser}>Criador: {involvement.project?.creator?.name}</a>
                            </p>
                        </div>
                    </div>
                    {typeSituation == InvolvementSituationEnum.Recebido ? (
                        <div className="grid grid-cols-2 my-4">
                            <button
                                type="button"
                                className="w-full py-2 px-8 text-lg font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                onClick={handleClickAccept}
                            >
                                Aceitar
                            </button>
                            <button
                                type="button"
                                className="w-full ml-2 py-2 px-8 text-lg font-medium rounded-md text-white bg-red-500 hover:bg-red-700 transition-colors"
                                onClick={handleClickReject}
                            >
                                Rejeitar
                            </button>
                        </div>
                    ) : null}
                    {typeSituation == InvolvementSituationEnum.Enviado ? (
                        <div className="grid grid-cols-1 my-4">
                            <button
                                type="button"
                                className="w-full ml-2 py-2 px-8 text-lg font-medium rounded-md text-white bg-red-500 hover:bg-red-700 transition-colors"
                                onClick={handleClickRemove}
                            >
                                Cancelar Solicitação
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default InvolvementPendingItem;