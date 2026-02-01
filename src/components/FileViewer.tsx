import React, { useState } from 'react';
import FormDialogBase, { FormDialogBaseRef } from './FormDialogBase';
import { FileData } from '../models/FileData';
import { FiFile } from 'react-icons/fi';
import DocViewer, { DocViewerRenderers, IDocument } from "@cyntler/react-doc-viewer";
import { useTranslation } from 'react-i18next';

interface FileViewerProps {
    files: FileData[];
}

const FileViewer: React.FC<FileViewerProps> = ({ files }) => {

    const { t } = useTranslation();
    const [selectedFile, setSelectedFile] = useState<IDocument[] | null>(null);
    const formDialogRef = React.useRef<FormDialogBaseRef>(null);
    const url = process.env.REACT_APP_FILES_ENDPOINT_URL;

    const openFileViewer = async (file: FileData) => {
        file.url = url + "/" + file.bucket + "/" + file.name;
        const docs: IDocument[] = [
            { uri: file.url },
        ];
        setSelectedFile(docs);
        if (formDialogRef.current) {
            formDialogRef.current.openDialog();
        }
    };

    const closeFileViewer = () => {
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
            <FormDialogBase
                ref={formDialogRef}
                title={t("common.viewFile")}
                initialOpen={false}
                submit={() => closeFileViewer()}
            >
                {selectedFile && (
                    <div className="h-70vh">
                        <DocViewer documents={selectedFile} pluginRenderers={DocViewerRenderers} />
                    </div>
                )}
            </FormDialogBase>
        </>
    );
};

export default FileViewer;
