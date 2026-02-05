import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { requestConfirm } from "./confirmManager";

const POSITION = "top-center";

const notifyProvider = {

    error: (message: string) => {
        toast.error(message, {
            position: POSITION
        });
    },

    success: (message: string) => {
        toast.success(message, {
            position: POSITION
        });
    },

    info: (message: string) => {
        toast.info(message, {
            position: POSITION
        });
    },

    confirm: (
        message: string,
        options?: { title?: string; confirmLabel?: string; cancelLabel?: string }
    ): Promise<boolean> => {
        return requestConfirm({
            message,
            title: options?.title,
            confirmLabel: options?.confirmLabel,
            cancelLabel: options?.cancelLabel,
        });
    },

}

export default notifyProvider;
