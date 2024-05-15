import React, { useState } from 'react';
import FormDialogBase, { FormDialogBaseRef } from './FormDialogBase';
import { FileData } from '../../types/FileData';
import { FiFile } from 'react-icons/fi';

interface FileViewerProps {
    files: FileData[];
}

const FileViewer: React.FC<FileViewerProps> = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const formDialogRef = React.useRef<FormDialogBaseRef>(null);

    const openFileViewer = async (file: FileData) => {
        //@todo propagar URl e Type para o modelo de retorno do backend
        file.url = process.env.bucketEndpoint + "/" + file.bucket + "/" + file.name;
        file.type = "image";
        setSelectedFile(file);
        if (formDialogRef.current) {
            formDialogRef.current.openDialog();
        }
    };

    const closeFileViewer = (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setSelectedFile(null);
        if (formDialogRef.current) {
            formDialogRef.current.closeDialog();
        }
    };

    return (
        <>
            <ul>
                {files.map((file) => (
                    <li key={file.id}>
                        <button className="inline-flex items-center w-full px-4 py-2 bg-purple-500 text-white font-bold rounded-md hover:bg-purple-700 transition-colors mb-2" onClick={() => openFileViewer(file)}><FiFile className="m-2" />{file.name}</button>
                    </li>
                ))}
            </ul>
            <FormDialogBase ref={formDialogRef} title="Visualizar Arquivo" initialOpen={false} submit={(event: React.FormEvent) => closeFileViewer(event)}>
                {selectedFile && (
                    <div>
                        {selectedFile.name}
                        {selectedFile.type === 'image' && (
                            <img src={selectedFile.url} alt={selectedFile.name} />
                        )}
                        {selectedFile.type === 'video' && (
                            <video controls>
                                <source src={selectedFile.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )}
                    </div>
                )}
            </FormDialogBase>
        </>
    );
};

export default FileViewer;