import React, { useEffect, useImperativeHandle, useState } from 'react';
import { FiPlusCircle, FiTrash } from 'react-icons/fi';
import CustomizableRow, { CustomizableRowProps, Operation } from './CustomizableRow';
import notifyService from '../../services/notifyService';

export interface CustomizableTableRows extends CustomizableRowProps {
    id: number;
}

interface CustomizableTableProps {
    operation: Operation,
    onChange: (CustomizableTableRows: CustomizableTableRows[]) => void;
    maxColumnCount?: number;
    forceShowAddRows?: boolean;
    forceHiddeColumnsActions?: boolean;
    defaultRows?: CustomizableTableRows[];
}

export interface CustomizableTableRef {
    setRows: (rows: CustomizableTableRows[]) => void;
}

const CustomizableTable = React.forwardRef<CustomizableTableRef, CustomizableTableProps>((props, ref) => {

    useImperativeHandle(ref, () => ({
        setRows: (rows: CustomizableTableRows[]) => {
            defineRows(rows);
        },
    }));

    const getIdRow = () => {
        return Date.now();
    }

    const getMaxColumnCount = () => {
        return props.maxColumnCount ?? 6;
    }

    const getDefaultsRows = (): CustomizableTableRows[] => {
        let defaultRows: CustomizableTableRows[] = props.defaultRows ?? [];
        if (props.operation == Operation.Edit) {
            defaultRows = [
                { id: getIdRow(), minColumnCount: 1, maxColumnCount: getMaxColumnCount(), columns: [] },
            ];
        }
        return defaultRows;
    };

    const [customizableTableRows, setRows] = useState<CustomizableTableRows[]>(getDefaultsRows());

    useEffect(() => {
        
      }, [customizableTableRows]);

    const updateRow = (index: number, updatedColumns: any[]) => {
        const updatedRows = [...customizableTableRows];
        updatedRows[index].columns = updatedColumns;
        defineRows(updatedRows);
    };

    const addRow = () => {
        const newRow = {
            id: getIdRow(),
            minColumnCount: 1,
            maxColumnCount: getMaxColumnCount(),
            columns: [],
        };
        const newRows = [...customizableTableRows, newRow];
        defineRows(newRows);
    };

    const handleRemoveRow = (id: number) => {
        const newRows = customizableTableRows.filter((row) => row.id !== id);
        if (!newRows.length) {
            notifyService.info("Necessário ao menos uma linha");
        } else {
            defineRows(newRows);
        }
    };

    const defineRows = (newRows: CustomizableTableRows[]) => {
        setRows(newRows);
        props.onChange(newRows);
    }

    return (
        <div className="pt-4">
            {customizableTableRows.map((row, index) => (
                <div key={row.id} className={(!props.forceHiddeColumnsActions ? "odd:bg-gray-200" : "") + " flex justify-between items-center"}>
                    <CustomizableRow
                        key={`row` + row.id}
                        operation={props.operation}
                        columns={row.columns}
                        minColumnCount={row.minColumnCount}
                        maxColumnCount={row.maxColumnCount}
                        hiddeColumnsActions={props.forceHiddeColumnsActions}
                        onChange={(updatedColumns) => updateRow(index, updatedColumns)}
                    />
                    {props.operation == Operation.Edit || props.forceShowAddRows ? (
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
            {props.operation == Operation.Edit || props.forceShowAddRows ? (
                <button type="button" onClick={addRow} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 w-full mt-2 flex justify-center items-center rounded-md">
                    <FiPlusCircle className="mr-2" /> Adicionar Linha
                </button>
            ) : null}

        </div>
    );
});

export default CustomizableTable;
