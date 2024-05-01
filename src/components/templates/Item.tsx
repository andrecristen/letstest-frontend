import React from 'react';
import { FiCopy, FiFileText, FiEye } from 'react-icons/fi';
import { TemplateData, getTemplateTypeDescription } from '../../types/TemplateData';

interface TemplateItemProps {
    template: TemplateData;
    onDuplicate: () => void;
    onView: () => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onDuplicate, onView }) => {
    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-purple-700 w-6 h-6" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {template.id}</p>
                    <p className="font-bold text-lg text-purple-700">{template.name}</p>
                    <p className="font-bold text-sm text-gray-500">{getTemplateTypeDescription(template.type)}</p>
                    <p className="text-sm text-gray-500 line-clamp-3">{template.description}</p>
                </div>
            </div>

            <div className="card-flex-actions-container">
                <button
                    onClick={onDuplicate}
                    className="action-button-blue"
                >
                    <FiCopy className="w-5 h-5 mr-2" /> Personalizar
                </button>
                <button
                    onClick={onView}
                    className="action-button-green"
                >
                    <FiEye className="w-5 h-5 mr-2" /> Visualizar
                </button>
            </div>
        </div>
    );
};

export default TemplateItem;
