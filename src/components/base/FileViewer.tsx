import React, { useState } from 'react';
import FormDialogBase, { FormDialogBaseRef } from './FormDialogBase';
import { FileData } from '../../types/FileData';

interface FileViewerProps {
    files: FileData[];
}

const FileViewer: React.FC<FileViewerProps> = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const formDialogRef = React.useRef<FormDialogBaseRef>(null);

    const openFileViewer = (file: FileData) => {
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
                        <button onClick={() => openFileViewer(file)}>{file.name}</button>
                    </li>
                ))}
            </ul>
            <FormDialogBase ref={formDialogRef} title="Visualizar Arquivo" initialOpen={false} submit={(event: React.FormEvent) => closeFileViewer(event)}>
                {selectedFile && (
                    <div>
                        {/* Aqui você pode adicionar a lógica para exibir o conteúdo do arquivo */}
                        Nome do Arquivo: {selectedFile.name}
                        {/* Exemplo de exibição de conteúdo de arquivo de imagem */}
                        {/* {selectedFile.type === 'image' && (
                            <img src={selectedFile.url} alt={selectedFile.name} />
                        )} */}
                        {/* Exemplo de exibição de conteúdo de arquivo de vídeo */}
                        {/* {selectedFile.type === 'video' && (
                            <video controls>
                                <source src={selectedFile.url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        )} */}
                    </div>
                )}
            </FormDialogBase>
        </>
    );
};

export default FileViewer;