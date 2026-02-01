import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../ui/Modal";
import { Button, Field, Input } from "../../ui";
import { getProjectTesters } from "../../services/involvementService";
import { assignTesters } from "../../services/testCaseService";
import notifyProvider from "../../infra/notifyProvider";
import LoadingOverlay from "../../components/LoadingOverlay";

type TesterOption = {
  userId: number;
  user?: { id: number; name: string; email: string };
};

interface AssignTestersModalProps {
  open: boolean;
  projectId: number;
  testCaseId: number | null;
  initialSelected?: number[];
  readOnly?: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

const AssignTestersModal: React.FC<AssignTestersModalProps> = ({
  open,
  projectId,
  testCaseId,
  initialSelected,
  readOnly = false,
  onClose,
  onAssigned,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testers, setTesters] = useState<TesterOption[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>(initialSelected ?? []);

  useEffect(() => {
    if (!open) return;
    setSelected(initialSelected ?? []);
  }, [open, initialSelected]);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    getProjectTesters(projectId)
      .then((response) => {
        setTesters(response?.data ?? []);
      })
      .catch(() => {
        notifyProvider.error(t("testCase.assignLoadError"));
      })
      .finally(() => setLoading(false));
  }, [open, projectId, t]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return testers;
    return testers.filter((tester) => {
      const name = tester.user?.name?.toLowerCase() ?? "";
      const email = tester.user?.email?.toLowerCase() ?? "";
      return name.includes(term) || email.includes(term);
    });
  }, [search, testers]);

  const toggle = (userId: number) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    if (!testCaseId) return;
    if (readOnly) return;
    setSaving(true);
    try {
      const response = await assignTesters(testCaseId, selected);
      if (response?.status === 200) {
        notifyProvider.success(t("testCase.assignSuccess"));
        onAssigned?.();
        onClose();
      } else {
        throw new Error("assign");
      }
    } catch {
      notifyProvider.error(t("testCase.assignError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-3xl"
    >
      <LoadingOverlay show={loading || saving} />
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-xl text-ink">{t("testCase.assignTitle")}</h3>
          <p className="text-sm text-ink/60">{t("testCase.assignHelp")}</p>
        </div>

        <Field label={t("testCase.assignSearchLabel")}>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("testCase.assignSearchPlaceholder")}
          />
        </Field>

        <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-2xl border border-ink/10 bg-paper/70 p-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink/60">{t("testCase.assignEmpty")}</p>
          ) : (
            filtered.map((tester) => (
              <label
                key={tester.userId}
                className="flex items-center justify-between rounded-xl border border-ink/10 bg-paper px-3 py-2 text-sm text-ink/80"
              >
                <div>
                  <p className="font-semibold text-ink">{tester.user?.name}</p>
                  <p className="text-xs text-ink/60">{tester.user?.email}</p>
                </div>
                <input
                  type="checkbox"
                  checked={selected.includes(tester.userId)}
                  onChange={() => toggle(tester.userId)}
                  disabled={readOnly}
                  className="h-4 w-4 rounded border-ink/30 text-ink"
                />
              </label>
            ))
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          {!readOnly && (
            <Button type="button" variant="primary" onClick={handleAssign}>
              {t("testCase.assignConfirm")}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AssignTestersModal;
