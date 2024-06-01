import React from "react";
import { FiEdit, FiEye, FiFileText } from "react-icons/fi";
import { TestScenarioData } from "../../models/TestScenarioData";

interface TestScenarioItemProps {
    testScenario: TestScenarioData
    onEdit?: () => void;
    onView?: () => void;
}

const TestCaseItem: React.FC<TestScenarioItemProps> = ({ testScenario, onEdit, onView }) => {
    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {testScenario.id}</p>
                    <p className="font-bold text-lg text-purple-700">{testScenario.name}</p>
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

                {onView ? (
                    <button
                        onClick={onView}
                        className="action-button-green"
                    >
                        <FiEye className="w-5 h-5 mr-2" /> Visualizar
                    </button>
                ) : null}

            </div>
        </div>
    );
};

export default TestCaseItem;