import React, { useState } from 'react';
import { FiPlusCircle, FiSave } from 'react-icons/fi';
import PainelContainer from '../base/PainelContainer';
import { TitleContainer } from '../base/TitleContainer';
import CustomizableRow from './CustomizableRow';

const TemplateEditor = () => {
    const [rows, setRows] = useState<{initialColumnCount: number; minColumnCount: number; maxColumnCount: number; columns: any[]; }[]>([
        {initialColumnCount: 2, minColumnCount: 1, maxColumnCount: 6, columns: [] }
    ]);

    const addRow = () => {
        const newRow = {
            initialColumnCount: 2,
            minColumnCount: 1,
            maxColumnCount: 6,
            columns: []
        };
        setRows([...rows, newRow]);
    };

    const handleSave = () => {
        const rowData = rows.map(row => ({
            columns: row.columns.map(column => ({
                type: column.type,
                content: column.content
            }))
        }));
        console.log(JSON.stringify(rowData, null, 2));
    };

    const updateRow = (index: number, updatedColumns: any[]) => {
        const updatedRows = [...rows];
        updatedRows[index].columns = updatedColumns;
        setRows(updatedRows);
    };

    return (
        <PainelContainer>
            <TitleContainer title="Personalizar Template" />
            {rows.map((row, index) => (
                <CustomizableRow
                    initialColumnCount={row.initialColumnCount}
                    minColumnCount={row.minColumnCount}
                    maxColumnCount={row.maxColumnCount}
                    onChange={(updatedColumns) => updateRow(index, updatedColumns)}
                />
            ))}
            <button onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 w-full mt-2 flex justify-center items-center rounded-md">
                <FiPlusCircle className="mr-2" /> Adicionar Linha
            </button>
            <button onClick={handleSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 w-full mt-2 flex justify-center items-center rounded-md">
                <FiSave className="mr-2" /> Salvar
            </button>
        </PainelContainer>
    );
};

export default TemplateEditor;