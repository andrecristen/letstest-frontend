import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";

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

}

export default notifyProvider;