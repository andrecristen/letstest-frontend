import { useState } from "react";
import { FiCheck } from "react-icons/fi";

interface EditFormProps {
    initialValue: string;
    column: Column;
    onSubmit: (value: string) => void;
    onClose: () => void;
}

export enum ColumnType {
    Text = 'Texto',
    Label = 'Label',
    Image = 'Imagem',
    Empty = 'Espaço',
}

export interface Column {
    type: ColumnType;
    content: string;
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

export default EditForm;