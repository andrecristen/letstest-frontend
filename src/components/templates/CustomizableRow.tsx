import React, { useEffect, useState } from 'react';
import { FiCheck, FiEdit, FiPlusCircle, FiTrash, FiType, FiX, FiXSquare } from 'react-icons/fi';
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

  const updateColumnType = (index: number, newType: ColumnType) => {
    const updatedColumns = [...columns];
    updatedColumns[index].type = newType;
    updateColumns(updatedColumns);
  };

  const updateColumnContent = (index: number, content: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index].content = content;
    updateColumns(updatedColumns);
  };

  const toggleEditForm = (index: number) => {
    if (editColumnIndex === index && isEditing) {
      handleEditFormSubmit(index, columns[index].content);
    } else {
      setEditColumnIndex(index);
      setIsEditing(true);
    }
  };

  const handleEditFormSubmit = (index: number, newContent: string) => {
    updateColumnContent(index, newContent);
    setEditColumnIndex(null);
    setIsEditing(false);
  };

  const updateColumns = (updatedColumns: Column[]) => {
    setColumns(updatedColumns);
    onChange(updatedColumns);
  }

  const getColumnEditingType = (index: number,) => {
    if (columns[index]) {
      return columns[index].type
    }
    return null;
  }

  return (
    <div className="flex border border-gray-300 overflow-hidden">
      {columns.map((column, index) => (
        <div key={index} className="flex-auto border-r border-gray-300 p-2 relative">
          {editColumnIndex === index ? (
            <EditForm
              column={column}
              initialValue={column.content}
              onSubmit={newContent => handleEditFormSubmit(index, newContent)}
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
              {editColumnIndex === index && (
                <ul className="dropdown-menu fixed text-gray-700 pt-1 bg-purple-400 rounded-md min-w-36">
                  {Object.values(ColumnType).map((type: ColumnType) => (
                    <li key={type}>
                      <button
                        onClick={() => updateColumnType(index, type)}
                        className={`px-4 py-2 text-sm text-white ${getColumnEditingType(editColumnIndex) === type ? 'bg-purple-500 hover:text-white' : 'hover:bg-purple-600'} w-full text-left flex justify-between items-center`}
                      >
                        <span>{type}</span>
                        {getColumnEditingType(editColumnIndex) === type && <FiCheck />}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button
                      onClick={() => deleteColumn(index)}
                      className="px-4 py-2 text-sm text-red-700 bg-red-200 hover:bg-red-400 hover:text-white w-full  text-left flex justify-between items-center"
                    >
                      <span>Excluir</span>
                      <FiTrash />
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
      <button onClick={addColumn} className="bg-blue-500 text-white px-4 py-2 flex items-center"><FiPlusCircle /></button>
    </div>
  );
};

export default CustomizableRow;
