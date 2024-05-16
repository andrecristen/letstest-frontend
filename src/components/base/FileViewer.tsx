import React, { useState } from 'react';
import FormDialogBase, { FormDialogBaseRef } from './FormDialogBase';
import { FileData } from '../../types/FileData';
import { FiFile } from 'react-icons/fi';
import DocViewer, { DocViewerRenderers, IDocument } from "@cyntler/react-doc-viewer";

interface FileViewerProps {
    files: FileData[];
}

const FileViewer: React.FC<FileViewerProps> = ({ files }) => {
    const [selectedFile, setSelectedFile] = useState<IDocument[] | null>(null);
    const formDialogRef = React.useRef<FormDialogBaseRef>(null);
    const url = process.env.REACT_APP_FILES_ENDPOINT_URL;

    const openFileViewer = async (file: FileData) => {
        file.url = url + "/" + file.bucket + "/" + file.name;
        console.log(file.url);
        const docs: IDocument[] = [
            { uri: file.url },
        ];
        setSelectedFile(docs);
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
            <div>
                {files.map((file) => (
                    <button 
                        key={file.id}
                        className="inline-flex items-center w-full px-2 py-1 bg-purple-500 text-white font-bold rounded-md hover:bg-purple-700 transition-colors mb-2 overflow-hidden" 
                        style={{ maxWidth: '100%', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} 
                        onClick={() => openFileViewer(file)}
                    >
                        <FiFile className="m-2" />
                        <span className="overflow-hidden whitespace-nowrap">Arquivo #{file.id}</span>
                    </button>
                ))}
            </div>
            <FormDialogBase fullScreen={true} ref={formDialogRef} title="Visualizar Arquivo" initialOpen={false} submit={(event: React.FormEvent) => closeFileViewer(event)}>
                {selectedFile && (
                    <div>
                        <DocViewer className="min-h-full" documents={selectedFile} />
                    </div>
                )}
            </FormDialogBase>
        </>
    );
};

export default FileViewer;