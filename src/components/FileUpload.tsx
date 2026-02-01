import React, { useCallback, useState, useRef } from 'react';
import { AxiosProgressEvent } from 'axios';
import notifyProvider from '../infra/notifyProvider';
import { upload } from '../services/fileService';
import { FiXCircle } from 'react-icons/fi';
import { FileData } from '../models/FileData'; // Importando o tipo FileData
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
    onChange: (files: FileData[]) => void;
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onChange, disabled = false, required = false, multiple = false }) => {
    const { t } = useTranslation();

    const [uploading, setUploading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
    const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFilesToUpload(Array.from(files));
        }
    };

    const uploadFile = useCallback(async () => {
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', filesToUpload[currentFileIndex]);
            const response = await upload(formData, {
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    if (progressEvent && progressEvent.total !== null && progressEvent.loaded !== null) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                        setProgress(percentCompleted);
                    }
                },
            });
            if (response?.status !== 201) {
                throw new Error(response?.data);
            } else {
                setProgress(0);
                setCurrentFileIndex(currentFileIndex + 1);
                const newFiles = [...uploadedFiles, response?.data];
                setUploadedFiles(newFiles);
                if (currentFileIndex === filesToUpload.length - 1) {
                    setUploading(false);
                    setCurrentFileIndex(0);
                    setFilesToUpload([]);
                    onChange(newFiles);
                    clearCurrentSelectedFiles();
                }
            }
        } catch (error: any) {
            notifyProvider.error(t('fileUpload.uploadError', { error: error.toString() }));
            clearCurrentSelectedFiles();
            setUploading(false);
            setCurrentFileIndex(0);
            setProgress(0);
            setFilesToUpload([]);
        }
    }, [currentFileIndex, filesToUpload, onChange, t, uploadedFiles]);

    const clearCurrentSelectedFiles = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    React.useEffect(() => {
        if (filesToUpload.length > 0 && currentFileIndex < filesToUpload.length) {
            uploadFile();
        }
    }, [filesToUpload, currentFileIndex, uploadFile]);

    const handleRemoveFile = (id: number) => {
        setUploadedFiles(uploadedFiles.filter((file) => file.id !== id));
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={disabled || uploading}
                required={required && !uploadedFiles}
                multiple={multiple}
                className="w-full h-full p-0"
            />
            {uploading && (
                <div>
                    <div>{t('fileUpload.uploading', { current: currentFileIndex + 1, total: filesToUpload.length })}</div>
                    <progress value={progress} max="100" className="w-full" />
                </div>
            )}
            {uploadedFiles.length > 0 && (
                <div>
                    <h3>{t('fileUpload.uploadedSuccess')}</h3>
                    <ul>
                        {uploadedFiles.map((file) => (
                            <li key={file.id}>
                                <button onClick={() => handleRemoveFile(file.id)}>
                                    <FiXCircle className="text-red-700 mx-2 inline-flex items-center" />
                                </button>
                                {file.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default FileUpload;
