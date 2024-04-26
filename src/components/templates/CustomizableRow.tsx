import React, { useEffect, useState } from 'react';
import { FiEdit, FiPlusCircle, FiTrash, FiXSquare } from 'react-icons/fi';
import notifyService from '../../services/notifyService';
import EditForm, { Column, ColumnType } from './ColumnFormEditor';

interface CustomizableRowProps {
  minColumnCount: number;
  maxColumnCount: number;
  onChange: (columns: Column[]) => void;
}

const CustomizableRow: React.FC<CustomizableRowProps> = ({ minColumnCount, maxColumnCount, onChange }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [editColumnIndex, setEditColumnIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [appliedInitialColumnCount, setAppliedInitialColumnCount] = useState<boolean>(false);

  useEffect(() => {
    if (!appliedInitialColumnCount) {
      addColumn();
      setAppliedInitialColumnCount(true);
    }
  }, []);

  const addColumn = () => {
    if (columns.length < maxColumnCount) {
      const updatedColumns = [...columns, { type: ColumnType.Text, content: '' }];
      updateColumns(updatedColumns);
    } else {
      notifyService.info(`Linha não pode ter mais de ${maxColumnCount} coluna(s)`);
    }
  };

  const deleteColumn = (index: number) => {
    if (columns.length > minColumnCount) {
      const updatedColumns = [...columns];
      updatedColumns.splice(index, 1);
      updateColumns(updatedColumns);
      if (editColumnIndex === index) {
        setEditColumnIndex(null);
        setIsEditing(false);
      }
    } else {
      notifyService.info(`Linha precisa ter ao menos ${minColumnCount} coluna(s)`);
    }
  };

  const updateColumnContent = (index: number, content: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index].content = content;
    updateColumns(updatedColumns);
  };

  const toggleEditForm = (index: number) => {
    if (editColumnIndex === index && isEditing) {
      handleEditFormSubmit(index, columns[index]);
    } else {
      setEditColumnIndex(index);
      setIsEditing(true);
    }
  };

  const handleEditFormSubmit = (index: number, updatedColumn: Column) => {
    updateColumns(columns);
    setEditColumnIndex(null);
    setIsEditing(false);
  };

  const updateColumns = (updatedColumns: Column[]) => {
    setColumns(updatedColumns);
    onChange(updatedColumns);
  }

  return (
    <div className="flex border border-gray-300 overflow-hidden">
      {columns.map((column, index) => (
        <div key={index} className="flex-auto border-r border-gray-300 p-2 relative">
          {editColumnIndex === index ? (
            <EditForm
              column={column}
              onSubmit={updatedColumn => handleEditFormSubmit(index, updatedColumn)}
              onClose={() => toggleEditForm(index)}
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
                <span onClick={() => toggleEditForm(index)} className="w-full text-black px-2 py-1 cursor-pointer">
                  {column.content || 'Editar Label'}:
                </span>
              )}
              {column.type === ColumnType.Image && (
                <img src={column.content} alt="Imagem" onClick={() => toggleEditForm(index)} className="cursor-pointer" />
              )}
              {column.type === ColumnType.Empty && (
                <div className="w-full text-center"> - </div>
              )}
            </>
          )}
          <div className="absolute right-2 top-2">
            <div className="dropdown inline-block relative">
              <button className="bg-transparent border-none" onClick={() => toggleEditForm(index)}>
                {editColumnIndex === index && isEditing ? <FiXSquare /> : <FiEdit />}
              </button>
              <button className="bg-transparent border-none" onClick={() => deleteColumn(index)}>
                <FiTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button onClick={addColumn} className="bg-blue-500 text-white px-4 py-2 flex items-center"><FiPlusCircle /></button>
    </div>
  );
};

export default CustomizableRow;
