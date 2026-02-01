import React, { useRef, useState, useImperativeHandle } from "react";
import LoadingOverlay from "./LoadingOverlay";
import { Button, Modal } from "../ui";
import { useTranslation } from "react-i18next";

interface FormDialogBaseProps {
    initialOpen?: boolean;
    submit: (event?: React.FormEvent) => void | Promise<void>;
    cancel?: (event: React.FormEvent) => void;
    title: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    modalClassName?: string;
    children?: React.ReactNode;
}

export interface FormDialogBaseRef {
    openDialog: () => void;
    closeDialog: () => void;
}

export interface FormDialogBaseExtendsRef extends FormDialogBaseRef {
    setData: (data: any) => void;
}

const FormDialogBase = React.forwardRef<FormDialogBaseRef, FormDialogBaseProps>((props, ref) => {

    const { t } = useTranslation();
    const [dialogVisible, setDialogVisible] = useState<boolean>(props.initialOpen ?? false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
        openDialog: () => {
            setDialogVisible(true);
        },
        closeDialog: () => {
            setDialogVisible(false);
        },
    }));

    const handleCancel = (event?: React.FormEvent) => {
        setDialogVisible(false);
        if (props.cancel) {
            props.cancel(event as React.FormEvent);
        }
    }

    const handleSubmit = async () => {
        setSubmitting(true);
        await props.submit();
        setSubmitting(false);
    }

    return (
        <>
            <LoadingOverlay show={submitting} />
            <Modal open={dialogVisible} onClose={() => handleCancel()} className={props.modalClassName}>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <h3 className="font-display text-xl text-ink">{props.title}</h3>
                        <div>{props.children}</div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                        {props.cancel ? (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                ref={cancelButtonRef}
                            >
                                {props.cancelLabel ?? t("common.cancel")}
                            </Button>
                        ) : null}
                        <Button type="button" variant="accent" onClick={handleSubmit}>
                            {props.confirmLabel ?? t("common.confirm")}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
});

export default FormDialogBase;
