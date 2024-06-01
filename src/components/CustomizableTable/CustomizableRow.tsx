import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlusCircle, FiTrash, FiXSquare } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import EditForm, { Column, ColumnType } from './ColumnFormEditor';
import FileUpload from '../FileUpload';
import CustomizableTable, { CustomizableTableRows } from './CustomizableTable';
import { FileData } from '../../models/FileData';
import FileViewer from '../FileViewer';
import TagRender from "../TagRender";

export enum Operation {
  Edit = 'Edição',
  FillIn = 'Preencher',
  View = 'Visualizar',
}
export interface CustomizableRowProps {
  projectId?: number;
  columns?: Column[],
  operation?: Operation,
  minColumnCount: number;
  maxColumnCount: number;
  onChange?: (columnsRow: Column[]) => void;
  hiddeColumnsActions?: boolean;
}

const CustomizableRow: React.FC<CustomizableRowProps> = ({ projectId, columns, operation, minColumnCount, maxColumnCount, onChange, hiddeColumnsActions }) => {
  const [columnsRow, setcolumnsRow] = useState<Column[]>(columns || []);
  const [editColumnIndex, setEditColumnIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [appliedInitialColumnCount, setAppliedInitialColumnCount] = useState<boolean>(false);

  const getIdColumn = () => {
    return Date.now();
  }

  useEffect(() => {
    if (!appliedInitialColumnCount && !columnsRow.length) {
      addColumn();
      setAppliedInitialColumnCount(true);
    }
  }, [columnsRow]);

  const addColumn = () => {
    if (columnsRow.length < maxColumnCount) {
      const updatedcolumnsRow = [...columnsRow, { id: getIdColumn(), type: ColumnType.Text, content: '' }];
      applyUpdateColumnsRow(updatedcolumnsRow);
    } else {
      notifyProvider.info(`Linha não pode ter mais de ${maxColumnCount} coluna(s)`);
    }
  };

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
      notifyProvider.info(`Linha precisa ter ao menos ${minColumnCount} coluna(s)`);
    }
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

  const applyUpdateColumnsRow = (updatedcolumnsRow: Column[]) => {
    setcolumnsRow(updatedcolumnsRow);
    if (onChange) {
      onChange(updatedcolumnsRow);
    }
  }

  const isEdit = () => {
    return operation == Operation.Edit;
  }

  const isFillIn = () => {
    return operation == Operation.FillIn;
  }

  const isView = () => {
    return operation == Operation.View;
  }

  const getOperation = () => {
    return operation ?? Operation.Edit;
  }

  return (
    <div className="flex border border-gray-300 overflow-hidden w-full h-full min-h-12">
      {columnsRow.map((column, index) => (
        <div key={`column` + column.id} className="w-full flex-auto border-r border-gray-300 p-2 relative">
          {editColumnIndex === index ? (
            <EditForm
              projectId={projectId}
              column={column}
              onFinish={() => toggleEditForm(index)}
            />
          ) : (
            <>
              {column.type === ColumnType.Text && (
                <input
                  placeholder={column.placeholder ?? "Preencha o campo"}
                  type="text"
                  value={column.content}
                  disabled={isEdit() || isView()}
                  required={isFillIn()}
                  onChange={e => updateColumnContent(index, e.target.value)}
                  className="form-input w-full h-full p-0"
                />
              )}
              {column.type === ColumnType.LongText && (
                <textarea
                  placeholder={column.placeholder ?? "Preencha o campo"}
                  rows={4}
                  value={column.content}
                  disabled={isEdit() || isView()}
                  required={isFillIn()}
                  onChange={e => updateColumnContent(index, e.target.value)}
                  className="form-input w-full h-full p-0"
                />
              )}
              {column.type === ColumnType.Label && (
                <span className="w-full h-full text-black ">
                  {column.content || 'Editar Label'}:
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
                <CustomizableTable defaultRows={column.rows} maxColumnCount={1} forceHiddeColumnsActions={true} forceShowAddRows={getOperation() == Operation.FillIn} operation={getOperation()} onChange={(rows) => { updateColumnRows(rows, index) }} />
              )}
              {column.type === ColumnType.Table && (
                <CustomizableTable defaultRows={column.rows} operation={getOperation()} onChange={(rows) => { updateColumnRows(rows, index) }} />
              )}
              {column.type === ColumnType.Tag && (
                <TagRender tagValueId={parseInt(column.content + "")} operation={getOperation()} tagId={column.tagId || 0} onChange={(tagValueId) => updateColumnContent(index, tagValueId)} />
              )}
            </>
          )}
          {operation == Operation.Edit && !hiddeColumnsActions ? (
            <div className="absolute right-2 top-2">
              <div className="dropdown inline-block relative">
                <button type="button" className="bg-transparent border-none" onClick={() => toggleEditForm(index)}>
                  {editColumnIndex === index && isEditing ? <FiXSquare /> : <FiEdit />}
                </button>
                <button type="button" className="bg-transparent border-none" onClick={() => deleteColumn(index)}>
                  <FiTrash />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
      {operation == Operation.Edit && maxColumnCount > 1 ? (
        <button type="button" onClick={addColumn} className="bg-blue-500 text-white px-4 py-3 rounded-sm h-full flex items-center"><FiPlusCircle /></button>
      ) : null}
    </div>
  );
};

export default CustomizableRow;
