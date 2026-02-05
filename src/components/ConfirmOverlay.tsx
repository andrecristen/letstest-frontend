import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "../ui";
import { setConfirmListener } from "../infra/confirmManager";

type ConfirmState = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  resolve?: (value: boolean) => void;
};

const ConfirmOverlay: React.FC = () => {
  const { t } = useTranslation();
  const [state, setState] = useState<ConfirmState>({
    open: false,
    message: "",
  });
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const closeWith = useCallback((value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    setConfirmListener((request) => {
      resolveRef.current = request.resolve;
      setState({
        open: true,
        title: request.title,
        message: request.message,
        confirmLabel: request.confirmLabel,
        cancelLabel: request.cancelLabel,
      });
    });
    return () => setConfirmListener(null);
  }, []);

  if (!state.open) {
    return null;
  }

  return (
    <Modal open={state.open} onClose={() => closeWith(false)} className="max-w-md">
      <div className="space-y-4">
        <div className="space-y-1">
          {state.title ? (
            <p className="text-sm font-semibold text-ink">{state.title}</p>
          ) : null}
          <p className="text-sm text-ink/70">{state.message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => closeWith(false)}>
            {state.cancelLabel ?? t("common.cancel")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => closeWith(true)}>
            {state.confirmLabel ?? t("common.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmOverlay;
