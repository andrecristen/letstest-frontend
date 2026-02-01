import React from 'react';
import { useTranslation } from 'react-i18next';
interface LoadingOverlayProps {
  show?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ show }) => {
  const { t } = useTranslation();

  return (
    <>
      {show && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/40 backdrop-blur-sm">
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-4 rounded-2xl border border-ink/10 bg-paper/90 px-6 py-4 text-ink shadow-soft"
          >
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ocean/20" />
              <span className="h-10 w-10 animate-spin rounded-full border-2 border-ink/20 border-t-ocean" />
            </span>
            <div className="text-sm">
              <p className="font-semibold text-ink">{t("common.loading")}</p>
              <p className="text-ink/60">{t("common.pleaseWait")}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingOverlay;
