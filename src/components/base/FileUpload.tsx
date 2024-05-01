import React, { useState } from 'react';

interface FileUploadProps {
    onChange: (files: File[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onChange, multiple = false, disabled = false, required = false }) => {
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
                disabled={disabled}
                required={required}
                multiple={multiple}
                className="mb-4"
            />
        </div>
    );
};

export default FileUpload;
