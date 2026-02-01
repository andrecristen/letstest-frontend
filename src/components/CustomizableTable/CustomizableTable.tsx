import React, { useImperativeHandle, useState } from 'react';
import { FiCopy, FiPlus, FiTrash } from 'react-icons/fi';
import CustomizableRow, { CustomizableRowProps, Operation } from './CustomizableRow';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';

export interface CustomizableTableRows extends CustomizableRowProps {
    id: number;
}

interface CustomizableTableProps {
    projectId?: number;
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
    const { t } = useTranslation();

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
        if (props.operation === Operation.Edit) {
            defaultRows = [
                { id: getIdRow(), minColumnCount: 1, maxColumnCount: getMaxColumnCount(), columns: [] },
            ];
        }
        return defaultRows;
    };

    const [customizableTableRows, setRows] = useState<CustomizableTableRows[]>(getDefaultsRows());
    const [draggedRowIndex, setDraggedRowIndex] = useState<number | null>(null);

    const updateRow = (index: number, updatedColumns: any[]) => {
        const updatedRows = [...customizableTableRows];
        updatedRows[index].columns = updatedColumns;
        defineRows(updatedRows);
    };

    const duplicateRow = (index: number) => {
        const row = customizableTableRows[index];
        const duplicatedRow: CustomizableTableRows = {
            ...row,
            id: getIdRow(),
            columns: row.columns?.map((column) => ({
                ...column,
                id: getIdRow(),
                rows: column.rows ? column.rows.map((nestedRow) => ({
                    ...nestedRow,
                    id: getIdRow(),
                    columns: nestedRow.columns?.map((nestedColumn) => ({
                        ...nestedColumn,
                        id: getIdRow(),
                        rows: nestedColumn.rows ? nestedColumn.rows.map((deepRow) => ({
                            ...deepRow,
                            id: getIdRow(),
                        })) : undefined,
                    })) ?? [],
                })) : undefined,
                files: column.files ? [...column.files] : undefined,
            })) ?? [],
        };
        const updatedRows = [...customizableTableRows];
        updatedRows.splice(index + 1, 0, duplicatedRow);
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

    const reorderRows = (fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;
        const updatedRows = [...customizableTableRows];
        const [moved] = updatedRows.splice(fromIndex, 1);
        updatedRows.splice(toIndex, 0, moved);
        defineRows(updatedRows);
    };

    const handleRowDragStart = (index: number) => {
        setDraggedRowIndex(index);
    };

    const handleRowDragEnd = () => {
        setDraggedRowIndex(null);
    };

    const handleRowDrop = (index: number) => {
        if (draggedRowIndex === null) return;
        reorderRows(draggedRowIndex, index);
        setDraggedRowIndex(null);
    };

    const handleRemoveRow = (id: number) => {
        const newRows = customizableTableRows.filter((row) => row.id !== id);
        if (!newRows.length) {
            notifyProvider.info(t("customTable.minRowRequired"));
        } else {
            defineRows(newRows);
        }
    };

    const defineRows = (newRows: CustomizableTableRows[]) => {
        setRows(newRows);
        props.onChange(newRows);
    }

    return (
        <div className="space-y-1">
            {customizableTableRows.map((row, index) => (
                <div
                    key={row.id}
                    className={`flex items-stretch gap-1 ${draggedRowIndex === index ? "opacity-60" : ""}`}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleRowDrop(index)}
                >
                    {props.operation !== Operation.View ? (
                        <div
                            className="flex min-w-[40px] flex-col items-center justify-center rounded-md border border-ink/10 bg-paper/70 text-xs font-semibold text-ink/60 cursor-move"
                            draggable={props.operation === Operation.Edit || props.forceShowAddRows}
                            onDragStart={() => handleRowDragStart(index)}
                            onDragEnd={handleRowDragEnd}
                        >
                            {index + 1}
                        </div>
                    ) : null}
                    <CustomizableRow
                        key={`row` + row.id}
                        projectId={props.projectId}
                        operation={props.operation}
                        columns={row.columns}
                        minColumnCount={row.minColumnCount}
                        maxColumnCount={row.maxColumnCount}
                        hiddeColumnsActions={props.forceHiddeColumnsActions}
                        onChange={(updatedColumns) => updateRow(index, updatedColumns)}
                    />
                    {props.operation === Operation.Edit || props.forceShowAddRows ? (
                        <div className="flex flex-col overflow-hidden rounded-lg border border-ink/10 bg-paper/70">
                            <button
                                type="button"
                                onClick={() => duplicateRow(index)}
                                className="flex h-10 w-12 items-center justify-center text-ink/60 transition hover:bg-ink/10 hover:text-ink"
                                aria-label={t('customTable.duplicateRow')}
                            >
                                <FiCopy />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="flex h-10 w-12 items-center justify-center text-rose-500 transition hover:bg-rose-50 hover:text-rose-600"
                                aria-label={t('customTable.removeRow')}
                            >
                                <FiTrash />
                            </button>
                        </div>
                    ) : null}
                </div>
            ))}
            {props.operation === Operation.Edit || props.forceShowAddRows ? (
                <button
                    type="button"
                    onClick={addRow}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-ink/30 bg-paper/70 px-4 py-3 text-sm font-semibold text-ink/70 transition hover:border-ink/60 hover:bg-paper hover:text-ink"
                >
                    <FiPlus /> {t('customTable.addRow')}
                </button>
            ) : null}

        </div>
    );
});

export default CustomizableTable;
