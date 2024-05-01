import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlusCircle, FiTrash, FiXSquare } from 'react-icons/fi';
import notifyService from '../../services/notifyService';
import EditForm, { Column, ColumnType } from './ColumnFormEditor';
import FileUpload from '../base/FileUpload';

export enum Operation {
  Edit = 'Edição',
  FillIn = 'Preencher',
  View = 'Visualizar',
}
export interface CustomizableRowProps {
  columns?: Column[],
  operation?: Operation,
  minColumnCount: number;
  maxColumnCount: number;
  onChange?: (columnsRow: Column[]) => void;
}

const CustomizableRow: React.FC<CustomizableRowProps> = ({ columns, operation, minColumnCount, maxColumnCount, onChange }) => {
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
      updateColumnsRow(updatedcolumnsRow);
    } else {
      notifyService.info(`Linha não pode ter mais de ${maxColumnCount} coluna(s)`);
    }
  };

  const deleteColumn = (index: number) => {
    if (columnsRow.length > minColumnCount) {
      const updatedcolumnsRow = [...columnsRow];
      updatedcolumnsRow.splice(index, 1);
      updateColumnsRow(updatedcolumnsRow);
      if (editColumnIndex === index) {
        setEditColumnIndex(null);
        setIsEditing(false);
      }
    } else {
      notifyService.info(`Linha precisa ter ao menos ${minColumnCount} coluna(s)`);
    }
  };

  const updateColumnContent = (index: number, content: string) => {
    const updatedcolumnsRow = [...columnsRow];
    updatedcolumnsRow[index].content = content;
    updateColumnsRow(updatedcolumnsRow);
  };

  const updateColumnFiles = (files: File[], index: number) => {
    const updatedcolumnsRow = [...columnsRow];
    updatedcolumnsRow[index].files = files;
    updateColumnsRow(updatedcolumnsRow);
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

  const updateColumnsRow = (updatedcolumnsRow: Column[]) => {
    setcolumnsRow(updatedcolumnsRow);
    if (onChange) {
      onChange(updatedcolumnsRow);
    }
  }

  return (
    <div className="flex border border-gray-300 overflow-hidden w-full h-12">
      {columnsRow.map((column, index) => (
        <div key={`column` + column.id} className="flex-auto border-r border-gray-300 p-2 relative">
          {editColumnIndex === index ? (
            <EditForm
              column={column}
              onFinish={() => toggleEditForm(index)}
            />
          ) : (
            <>
              {column.type === ColumnType.Text && (
                <input
                  placeholder="Preencha o campo"
                  type="text"
                  value={column.content}
                  onChange={e => updateColumnContent(index, e.target.value)}
                  className="w-full border border-gray-200 focus:outline-none bg-transparent"
                />
              )}
              {column.type === ColumnType.Label && (
                <span className="w-full text-black px-2 py-1">
                  {column.content || 'Editar Label'}:
                </span>
              )}
              {column.type === ColumnType.Empty && (
                <div className="w-full text-center"> - </div>
              )}
              {column.type === ColumnType.File && (
                <FileUpload onChange={(files) => { updateColumnFiles(files, index) }} />
              )}
              {column.type === ColumnType.MultipleFiles && (
                <FileUpload onChange={(files) => { updateColumnFiles(files, index) }} multiple={true} />
              )}
            </>
          )}
          {operation == Operation.Edit ? (
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
      {operation == Operation.Edit ? (
        <button type="button" onClick={addColumn} className="bg-blue-500 text-white px-4 py-3 rounded-sm h-full flex items-center"><FiPlusCircle /></button>
      ) : null}
    </div>
  );
};

export default CustomizableRow;
