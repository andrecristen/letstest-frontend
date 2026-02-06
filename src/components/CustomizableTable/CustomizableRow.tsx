import React, { useCallback, useEffect, useState } from 'react';
import { FiCopy, FiEdit, FiPlus, FiTrash, FiXSquare } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import EditForm, { Column, ColumnType } from './ColumnFormEditor';
import FileUpload from '../FileUpload';
import CustomizableTable, { CustomizableTableRows } from './CustomizableTable';
import { FileData } from '../../models/FileData';
import FileViewer from '../FileViewer';
import TagRender from "../TagRender";
import { useTranslation } from 'react-i18next';

export enum Operation {
  Edit = 'edit',
  FillIn = 'fillIn',
  View = 'view',
}
export interface CustomizableRowProps {
  projectId?: number;
  columns?: Column[],
  operation?: Operation,
  minColumnCount: number;
  maxColumnCount: number;
  onChange?: (columnsRow: Column[]) => void;
  hiddeColumnsActions?: boolean;
  rowIndex?: number;
}

const CustomizableRow: React.FC<CustomizableRowProps> = ({ projectId, columns, operation, minColumnCount, maxColumnCount, onChange, hiddeColumnsActions }) => {
  const { t } = useTranslation();
  const [columnsRow, setcolumnsRow] = useState<Column[]>(columns || []);
  const [editColumnIndex, setEditColumnIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [appliedInitialColumnCount, setAppliedInitialColumnCount] = useState<boolean>(false);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

  const getIdColumn = () => {
    return Date.now();
  }

  const getColumnLabel = (index: number) => {
    let label = "";
    let currentIndex = index;
    while (currentIndex >= 0) {
      label = String.fromCharCode(65 + (currentIndex % 26)) + label;
      currentIndex = Math.floor(currentIndex / 26) - 1;
    }
    return label;
  };

  const cloneColumn = (column: Column): Column => ({
    ...column,
    id: getIdColumn(),
    rows: column.rows ? column.rows.map((row) => ({
      ...row,
      id: getIdColumn(),
      columns: row.columns?.map((item) => cloneColumn(item)) ?? [],
    })) : undefined,
    files: column.files ? [...column.files] : undefined,
  });

  const applyUpdateColumnsRow = useCallback((updatedcolumnsRow: Column[]) => {
    setcolumnsRow(updatedcolumnsRow);
    if (onChange) {
      onChange(updatedcolumnsRow);
    }
  }, [onChange]);

  const addColumn = useCallback(() => {
    if (columnsRow.length < maxColumnCount) {
      const updatedcolumnsRow = [...columnsRow, { id: getIdColumn(), type: ColumnType.Text, content: '' }];
      applyUpdateColumnsRow(updatedcolumnsRow);
    } else {
      notifyProvider.info(t('customTable.maxColumnsInfo', { count: maxColumnCount }));
    }
  }, [applyUpdateColumnsRow, columnsRow, maxColumnCount, t]);

  useEffect(() => {
    if (!appliedInitialColumnCount && !columnsRow.length) {
      addColumn();
      setAppliedInitialColumnCount(true);
    }
  }, [addColumn, appliedInitialColumnCount, columnsRow.length]);

  const deleteColumn = (index: number) => {
    if (columnsRow.length > minColumnCount) {
      const updatedcolumnsRow = [...columnsRow];
      updatedcolumnsRow.splice(index, 1);
      applyUpdateColumnsRow(updatedcolumnsRow);
      if (editColumnIndex === index) {
        setEditColumnIndex(null);
        setIsEditing(false);
      }
    } else {
      notifyProvider.info(t('customTable.minColumnsInfo', { count: minColumnCount }));
    }
  };

  const duplicateColumn = (index: number) => {
    if (columnsRow.length >= maxColumnCount) {
      notifyProvider.info(t('customTable.maxColumnsInfo', { count: maxColumnCount }));
      return;
    }
    const updatedcolumnsRow = [...columnsRow];
    const duplicated = cloneColumn(columnsRow[index]);
    updatedcolumnsRow.splice(index + 1, 0, duplicated);
    applyUpdateColumnsRow(updatedcolumnsRow);
  };

  const reorderColumns = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const updatedColumns = [...columnsRow];
    const [moved] = updatedColumns.splice(fromIndex, 1);
    updatedColumns.splice(toIndex, 0, moved);
    applyUpdateColumnsRow(updatedColumns);
  };

  const handleDragStart = (index: number) => {
    setDraggedColumnIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedColumnIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedColumnIndex === null) return;
    reorderColumns(draggedColumnIndex, index);
    setDraggedColumnIndex(null);
  };

  const updateColumnContent = (index: number, content: string | number) => {
    const updatedcolumnsRow = [...columnsRow];
    updatedcolumnsRow[index].content = content;
    applyUpdateColumnsRow(updatedcolumnsRow);
  };

  const updateColumnFiles = (files: FileData[], index: number) => {
    const updatedcolumnsRow = [...columnsRow];
    updatedcolumnsRow[index].files = files;
    applyUpdateColumnsRow(updatedcolumnsRow);
  }

  const updateColumnRows = (rows: CustomizableTableRows[], index: number) => {
    const updatedcolumnsRow = [...columnsRow];
    updatedcolumnsRow[index].rows = rows;
    applyUpdateColumnsRow(updatedcolumnsRow);
  }

  const toggleEditForm = (index: number) => {
    if (editColumnIndex === index && isEditing) {
      setEditColumnIndex(null);
      setIsEditing(false);
    } else {
      setEditColumnIndex(index);
      setIsEditing(true);
    }
  };

  const isEdit = () => {
    return operation === Operation.Edit;
  }

  const isFillIn = () => {
    return operation === Operation.FillIn;
  }

  const isView = () => {
    return operation === Operation.View;
  }

  const getOperation = () => {
    return operation ?? Operation.Edit;
  }

  const isViewMode = isView();
  const showHeader = !isViewMode;

  return (
    <div className="flex w-full min-h-12 flex-col overflow-hidden rounded-lg border border-ink/15 bg-paper shadow-sm sm:flex-row">
      {columnsRow.map((column, index) => (
        <div
          key={`column` + column.id}
          className={`group flex w-full flex-auto flex-col border-b border-ink/10 bg-paper/80 sm:border-b-0 sm:border-r ${draggedColumnIndex === index ? "opacity-60" : ""}`}
        >
          {showHeader ? (
            <div
              className={`flex items-center justify-between border-b border-ink/10 px-2 py-1 text-[11px] uppercase tracking-[0.2em] text-ink/50 ${operation === Operation.Edit && !hiddeColumnsActions ? "cursor-move" : ""}`}
              draggable={operation === Operation.Edit && !hiddeColumnsActions}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
            >
              <span className="flex-1 text-center">{getColumnLabel(index)}</span>
              {operation === Operation.Edit && !hiddeColumnsActions ? (
                <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded-full p-1 text-ink/60 transition hover:bg-ink/10 hover:text-ink"
                    onClick={() => toggleEditForm(index)}
                    aria-label={t('customTable.editColumn')}
                  >
                    {editColumnIndex === index && isEditing ? <FiXSquare /> : <FiEdit />}
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1 text-ink/60 transition hover:bg-ink/10 hover:text-ink"
                    onClick={() => duplicateColumn(index)}
                    aria-label={t('customTable.duplicateColumn')}
                  >
                    <FiCopy />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-1 text-ink/60 transition hover:bg-ink/10 hover:text-ink"
                    onClick={() => deleteColumn(index)}
                    aria-label={t('customTable.removeColumn')}
                  >
                    <FiTrash />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="relative flex-1 p-2">
          {editColumnIndex === index ? (
            <EditForm
              projectId={projectId}
              column={column}
              onFinish={() => toggleEditForm(index)}
            />
          ) : (
            <>
              {column.type === ColumnType.Text && !isViewMode && (
                <input
                  placeholder={column.placeholder ?? t('customTable.fillPlaceholder')}
                  type="text"
                  value={column.content}
                  disabled={isEdit() || isView()}
                  required={isFillIn()}
                  onChange={e => updateColumnContent(index, e.target.value)}
                  className="form-input h-full w-full border-0 bg-transparent p-0 text-sm"
                />
              )}
              {column.type === ColumnType.Text && isViewMode && (
                <div className="text-sm text-ink/80">
                  {column.content || t('customTable.emptyValue')}
                </div>
              )}
              {column.type === ColumnType.LongText && !isViewMode && (
                <textarea
                  placeholder={column.placeholder ?? t('customTable.fillPlaceholder')}
                  rows={4}
                  value={column.content}
                  disabled={isEdit() || isView()}
                  required={isFillIn()}
                  onChange={e => updateColumnContent(index, e.target.value)}
                  className="form-input h-full w-full resize-none border-0 bg-transparent p-0 text-sm"
                />
              )}
              {column.type === ColumnType.LongText && isViewMode && (
                <div className="whitespace-pre-wrap text-sm text-ink/80">
                  {column.content || t('customTable.emptyValue')}
                </div>
              )}
              {column.type === ColumnType.Label && (
                <span className="w-full h-full text-sm font-semibold text-ink">
                  {column.content || t('customTable.editLabelDefault')}:
                </span>
              )}
              {column.type === ColumnType.Empty && (
                <div className="w-full h-full text-center"></div>
              )}
              {column.type === ColumnType.File && !isView() && (
                <FileUpload disabled={isEdit()} required={isFillIn()} onChange={(files) => { updateColumnFiles(files, index) }} />
              )}
              {column.type === ColumnType.MultipleFiles && !isView() && (
                <FileUpload disabled={isEdit()} required={isFillIn()} onChange={(files) => { updateColumnFiles(files, index) }} multiple={true} />
              )}
              {(column.type === ColumnType.File || column.type === ColumnType.MultipleFiles) && isView() && (
                <FileViewer files={column.files || []} />
              )}
              {column.type === ColumnType.List && (
                <CustomizableTable defaultRows={column.rows} maxColumnCount={1} forceHiddeColumnsActions={true} forceShowAddRows={getOperation() === Operation.FillIn} operation={getOperation()} onChange={(rows) => { updateColumnRows(rows, index) }} />
              )}
              {column.type === ColumnType.Table && (
                <CustomizableTable defaultRows={column.rows} operation={getOperation()} onChange={(rows) => { updateColumnRows(rows, index) }} />
              )}
              {column.type === ColumnType.Tag && (
                <TagRender tagValueId={parseInt(column.content + "")} operation={getOperation()} tagId={column.tagId || 0} onChange={(tagValueId) => updateColumnContent(index, tagValueId)} />
              )}
            </>
          )}
          </div>
        </div>
      ))}
      {operation === Operation.Edit && maxColumnCount > 1 ? (
        <button
          type="button"
          onClick={addColumn}
          className="flex min-w-[64px] items-center justify-center border-l border-ink/10 bg-paper/70 text-ink/70 transition hover:bg-paper hover:text-ink"
          aria-label={t('customTable.addColumn')}
        >
          <FiPlus />
        </button>
      ) : null}
    </div>
  );
};

export default CustomizableRow;
