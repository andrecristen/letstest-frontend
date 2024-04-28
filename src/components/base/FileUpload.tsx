import React, { useState } from 'react';

interface FileUploadProps {
    onChange: (files: File[]) => void;
    multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({onChange, multiple = false }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setSelectedFiles(Array.from(files));
        }
        onChange(selectedFiles);
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
                multiple={multiple} // Define se a seleção múltipla está ativada
                className="mb-4"
            />
        </div>
    );
};

export default FileUpload;
