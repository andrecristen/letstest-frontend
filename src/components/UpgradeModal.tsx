import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../ui/Modal";
import { Button } from "../ui";

type LimitPayload = {
  metric?: string;
  limit?: number;
  current?: number;
};

const metricLabels: Record<string, string> = {
  seats: "billing.metricSeats",
  projects: "billing.metricProjects",
  test_cases: "billing.metricTestCases",
  storage_bytes: "billing.metricStorage",
  test_executions: "billing.metricExecutions",
};

const UpgradeModal: React.FC = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<LimitPayload | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<LimitPayload>).detail ?? {};
      setPayload(detail);
      setOpen(true);
    };
    window.addEventListener("billing:limit", handler as EventListener);
    return () => window.removeEventListener("billing:limit", handler as EventListener);
  }, []);

  const metricLabelKey = payload?.metric ? metricLabels[payload.metric] : null;

  return (
    <Modal open={open} onClose={() => setOpen(false)} className="max-w-md">
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
            {t("billing.limitTitle")}
          </p>
          <h2 className="font-display text-xl text-ink">
            {t("billing.limitSubtitle")}
          </h2>
        </div>
        <div className="space-y-2 text-sm text-ink/70">
          <p>
            {t("billing.limitDescription")}
          </p>
          {metricLabelKey ? (
            <p>
              {t("billing.limitMetric", {
                metric: t(metricLabelKey),
                current: payload?.current ?? 0,
                limit: payload?.limit ?? 0,
              })}
            </p>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("common.close")}
          </Button>
          <Button onClick={() => window.location.assign("/billing")}>
            {t("billing.upgradeAction")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UpgradeModal;
