import React, { useEffect, useImperativeHandle, useState } from 'react';
import { FiPlusCircle, FiTrash } from 'react-icons/fi';
import CustomizableRow, { CustomizableRowProps, Operation } from './CustomizableRow';

export interface CustomizableTableRows extends CustomizableRowProps {
    id: number;
}

interface CustomizableTableProps {
    operation: Operation,
    onChange: (CustomizableTableRows: CustomizableTableRows[]) => void;
}

export interface CustomizableTableRef {
    setRows: (rows: CustomizableTableRows[]) => void;
}

const CustomizableTable = React.forwardRef<CustomizableTableRef, CustomizableTableProps>((props, ref) => {

    useImperativeHandle(ref, () => ({
        setRows: (rows: CustomizableTableRows[]) => {
            setRows(rows);
        },
    }));

    const getIdRow = () => {
        return Date.now();
    }

    const [CustomizableTableRows, setRows] = useState<CustomizableTableRows[]>([
        { id: getIdRow(), minColumnCount: 1, maxColumnCount: 6, columns: [] }
    ]);

    const updateRow = (index: number, updatedColumns: any[]) => {
        const updatedRows = [...CustomizableTableRows];
        updatedRows[index].columns = updatedColumns;
        defineRows(updatedRows);
    };

    const addRow = () => {
        const newRow = {
            id: getIdRow(),
            minColumnCount: 1,
            maxColumnCount: 6,
            columns: [],
        };
        const newRows = [...CustomizableTableRows, newRow];
        defineRows(newRows);
    };

    const handleRemoveRow = (id: number) => {
        const newRows = CustomizableTableRows.filter((row) => row.id !== id);
        defineRows(newRows);
    };

    const defineRows = (newRows: CustomizableTableRows[]) => {
        setRows(newRows);
        props.onChange(newRows);
    }

    return (
        <div className="pt-4">
            {CustomizableTableRows.map((row, index) => (
                <div key={row.id} className="flex justify-between items-center">
                    <CustomizableRow
                        key={`row` + row.id}
                        operation={props.operation}
                        columns={row.columns}
                        minColumnCount={row.minColumnCount}
                        maxColumnCount={row.maxColumnCount}
                        onChange={(updatedColumns) => updateRow(index, updatedColumns)}
                    />
                    {props.operation == Operation.Edit ? (
                        <div className="flex border border-gray-300 overflow-hidden h-12">
                            <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-sm h-full"
                            >
                                <FiTrash />
                            </button>
                        </div>
                    ) : null}
                </div>
            ))}
            {props.operation == Operation.Edit ? (
                <button type="button" onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 w-full mt-2 flex justify-center items-center rounded-md">
                    <FiPlusCircle className="mr-2" /> Adicionar Linha
                </button>
            ) : null}

        </div>
    );
});

export default CustomizableTable;
