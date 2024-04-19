import React, { useState } from 'react';
import { FiCheck, FiEdit, FiPlusCircle, FiTrash, FiType, FiX, FiXSquare } from 'react-icons/fi';
import notifyService from '../../services/notifyService';

type ColumnType = 'text' | 'label' | 'image';

interface Column {
  type: ColumnType;
  content: string;
}

interface CustomizableRowProps {
  initialColumnCount: number;
  minColumnCount: number;
  maxColumnCount: number;
  onChange: (columns: Column[]) => void; // Adicionando propriedade onChange
}

const CustomizableRow: React.FC<CustomizableRowProps> = ({ initialColumnCount, minColumnCount, maxColumnCount, onChange }) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const [editColumnIndex, setEditColumnIndex] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<ColumnType>('text');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const addColumn = () => {
    if (columns.length < maxColumnCount) {
      setColumns([...columns, { type: 'text', content: '' }]);
      onChange([...columns, { type: 'text', content: '' }]);
    } else {
      notifyService.info(`Linha não pode ter mais de ${maxColumnCount} coluna(s)`);
    }
  };

  const deleteColumn = (index: number) => {
    if (columns.length > minColumnCount) {
      const updatedColumns = [...columns];
      updatedColumns.splice(index, 1);
      setColumns(updatedColumns);
      onChange(updatedColumns); // Chamando onChange com as colunas atualizadas

      // Fechar a edição se a coluna excluída estiver sendo editada
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
    setColumns(updatedColumns);
    setSelectedType(newType);
    onChange(updatedColumns); // Chamando onChange com as colunas atualizadas
  };

  const updateColumnContent = (index: number, content: string) => {
    const updatedColumns = [...columns];
    updatedColumns[index].content = content;
    setColumns(updatedColumns);
    onChange(updatedColumns); // Chamando onChange com as colunas atualizadas
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

  if (columns.length < initialColumnCount) {
    for (var i = 0; i < initialColumnCount; i++) {
      addColumn();
    }
  }

  return (
    <div className="flex border border-gray-300 overflow-hidden">
      {columns.map((column, index) => (
        <div key={index} className="flex-auto border-r border-gray-300 p-2 relative">
          {editColumnIndex === index ? (
            <EditForm
              initialValue={column.content}
              onSubmit={newContent => handleEditFormSubmit(index, newContent)}
              onClose={() => toggleEditForm(index)}
            />
          ) : (
            <>
              {column.type === 'text' && (
                <input
                  placeholder="Preencha o campo"
                  type="text"
                  value={column.content}
                  onChange={e => updateColumnContent(index, e.target.value)}
                  className="w-full border border-gray-200 focus:outline-none bg-transparent"
                />
              )}
              {column.type === 'label' && (
                <span onClick={() => toggleEditForm(index)} className="text-black px-2 py-1 cursor-pointer">
                  {column.content || 'Editar Label'}:
                </span>
              )}
              {column.type === 'image' && (
                <img src={column.content} alt="Imagem" onClick={() => toggleEditForm(index)} className="cursor-pointer" />
              )}
            </>
          )}
          <div className="absolute right-2 top-2">
            <div className="dropdown inline-block relative">
              <button className="bg-transparent border-none" onClick={() => toggleEditForm(index)}>
                {editColumnIndex === index && isEditing ? <FiXSquare /> : <FiEdit />}
              </button>
              {editColumnIndex === index && (
                <ul className="dropdown-menu fixed text-gray-700 pt-1 bg-purple-300 rounded-md min-w-36">
                  <li>
                    <button
                      onClick={() => updateColumnType(index, 'text')}
                      className={`block px-4 py-2 text-sm text-gray-900 ${selectedType === 'text' ? 'bg-purple-400 hover:text-white' : 'hover:bg-purple-400 hover:text-white'
                        } w-full text-left flex justify-between items-center`}
                    >
                      <span>Texto</span>
                      {selectedType === 'text' && <FiCheck />}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => updateColumnType(index, 'label')}
                      className={`block px-4 py-2 text-sm text-gray-900 ${selectedType === 'label' ? 'bg-purple-400 hover:text-white' : 'hover:bg-purple-400 hover:text-white'
                        } w-full text-left flex justify-between items-center`}
                    >
                      <span>Label</span>
                      {selectedType === 'label' && <FiCheck />}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => updateColumnType(index, 'image')}
                      className={`block px-4 py-2 text-sm text-gray-900 ${selectedType === 'image' ? 'bg-purple-400 hover:text-white' : 'hover:bg-purple-400 hover:text-white'
                        } w-full text-left flex justify-between items-center`}
                    >
                      <span>Imagem</span>
                      {selectedType === 'image' && <FiCheck />}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => deleteColumn(index)}
                      className="block px-4 py-2 text-sm text-red-700 bg-red-200 hover:bg-red-400 hover:text-white w-full text-left"
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

interface EditFormProps {
  initialValue: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

const EditForm: React.FC<EditFormProps> = ({ initialValue, onSubmit, onClose }) => {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={value} onChange={e => setValue(e.target.value)} />
      <button className="rounded-full bg-green-500 text-white focus:outline-none m-1 p-1" type="submit">
        <FiCheck />
      </button>
    </form>
  );
};

export default CustomizableRow;
