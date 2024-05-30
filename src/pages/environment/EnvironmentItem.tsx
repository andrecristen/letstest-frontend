import React from "react";
import { FiEdit, FiFileText } from "react-icons/fi";
import { EnvironmentData, getEnvironmentSituationDescription } from "../../models/EnvironmentData";

interface EnvironmentItemProps {
    environment: EnvironmentData;
    onEdit?: () => void;
}

const EnvironmentItem: React.FC<EnvironmentItemProps> = ({ environment, onEdit }) => {
    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {environment.id}</p>
                    <p className="font-bold text-lg text-purple-700">{environment.name}</p>
                    <p className="text-sm text-purple-700">Situação: {getEnvironmentSituationDescription(environment.situation)}</p>
                    <p className="text-sm text-purple-700">Descrição/Acesso: {environment.description}</p>
                </div>
            </div>

            <div className="card-flex-actions-container">
                {onEdit ? (
                    <button
                        onClick={onEdit}
                        className="action-button-blue"
                    >
                        <FiEdit className="w-5 h-5 mr-2" /> Editar
                    </button>
                ) : null}

            </div>
        </div>
    );
};

export default EnvironmentItem;