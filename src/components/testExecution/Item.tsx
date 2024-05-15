import React, { useEffect, useRef } from "react";
import { FiFileText } from "react-icons/fi";
import { Operation } from "../templates/CustomizableRow";
import CustomizableTable, { CustomizableTableRef, CustomizableTableRows } from "../templates/CustomizableTable";
import { TestExecutionData } from "../../types/TestExecutionData";

interface TestExecutionItemProps {
    testExecution: TestExecutionData;
}

const TestExecutionItem: React.FC<TestExecutionItemProps> = ({ testExecution }) => {

    const customizableTableTestExecutionRef = useRef<CustomizableTableRef>(null);

    useEffect(() => {
        const newRows: CustomizableTableRows[] = Object.values(testExecution.data);
        customizableTableTestExecutionRef.current?.setRows(newRows);
    }, []);


    return (
        <div className="card-flex">
            <div className="card-flex-details-container">
                <FiFileText className="text-lg text-purple-700" />
                <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900"># {testExecution.id}</p>
                </div>
            </div>
            <div className="card-flex-actions-container">
                {/* Insert actions */}
            </div>
            <div className="w-full">
                <CustomizableTable
                    ref={customizableTableTestExecutionRef}
                    operation={Operation.View}
                    onChange={() => { }}
                />
            </div>
        </div>
    );
};

export default TestExecutionItem;