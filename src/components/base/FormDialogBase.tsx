import React, { Fragment, useRef, useState, useImperativeHandle, ForwardedRef, RefObject } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useForm } from "react-hook-form"
import '../../styles/form.css';

interface FormDialogBaseProps {
    initialOpen?: boolean;
    submit: (event: React.FormEvent) => void;
    cancel?: (event: React.FormEvent) => void;
    title: React.ReactNode;
    children?: React.ReactNode;
}

export interface FormDialogBaseRef {
    openDialog: () => void;
    closeDialog: () => void;
}

export interface FormDialogBaseExtendsRef {
    getDialogBase: () => {
        current: FormDialogBaseRef
    },
    setData: (data: any) => void;
}

const FormDialogBase = React.forwardRef<FormDialogBaseRef, FormDialogBaseProps>((props, ref) => {
    const [dialogVisible, setDialogVisible] = useState<boolean>(props.initialOpen ?? false);
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
        openDialog: () => {
            setDialogVisible(true);
        },
        closeDialog: () => {
            setDialogVisible(false);
        },
    }));

    const handleCancel = (event: any) => {
        setDialogVisible(false);
        if (props.cancel) {
            props.cancel(event);
        }
    }

    return (
        <Transition.Root show={dialogVisible} as={Fragment}>
            <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={handleCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="w-full flex items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all my-8 w-full max-w-lg">
                                <form className="mt-8 space-y-6" onSubmit={props.submit} autoComplete="off">
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                {props.title}
                                            </Dialog.Title>
                                            {props.children}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="submit"
                                            className="inline-flex w-full justify-center rounded-md bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 sm:ml-3 sm:w-auto"
                                        >
                                            Confirmar
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                            onClick={handleCancel}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
});

export default FormDialogBase;