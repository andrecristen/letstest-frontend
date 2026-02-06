import React, { useState } from 'react';
import FormDialogBase, { FormDialogBaseRef } from './FormDialogBase';
import { FileData } from '../models/FileData';
import { FiFile } from 'react-icons/fi';
import { Button } from '../ui';
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
            <ul className="space-y-2">
                {files.map((file) => (
                    <li key={file.id}>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full justify-start"
                            leadingIcon={<FiFile />}
                            onClick={() => openFileViewer(file)}
                        >
                            {file.name}
                        </Button>
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
