type ConfirmRequest = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolve: (value: boolean) => void;
};

let listener: ((request: ConfirmRequest) => void) | null = null;

export const setConfirmListener = (nextListener: ((request: ConfirmRequest) => void) | null) => {
  listener = nextListener;
};

export const requestConfirm = (options: Omit<ConfirmRequest, "resolve">): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!listener) {
      resolve(false);
      return;
    }
    listener({ ...options, resolve });
  });
};
