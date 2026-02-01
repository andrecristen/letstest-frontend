import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import { Button, Card, Field, Input } from "../../ui";
import notifyProvider from "../../infra/notifyProvider";
import { useTranslation } from "react-i18next";
import {
  getNotificationSettings,
  updateNotificationSettings,
  NotificationSettings,
} from "../../services/notificationSettingsService";

const ProjectNotificationSettings: React.FC = () => {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getNotificationSettings(parseInt(projectId || "0", 10));
      setSettings(response?.data ?? null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSetting = (key: keyof NotificationSettings, value: boolean | number) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSubmit = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await updateNotificationSettings(settings.projectId, {
        enableExecutionRejected: settings.enableExecutionRejected,
        enableInviteAccepted: settings.enableInviteAccepted,
        enableDeadlineExceeded: settings.enableDeadlineExceeded,
        enableDeadlineWarning: settings.enableDeadlineWarning,
        deadlineWarningDays: settings.deadlineWarningDays,
        notifyEmail: settings.notifyEmail,
        notifyInApp: settings.notifyInApp,
      });
      if (response?.status === 200) {
        notifyProvider.success(t("notifications.settingsSaved"));
      } else {
        notifyProvider.error(t("notifications.settingsError"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <PainelContainer>
      <div className="space-y-6">
        <TitleContainer title={t("notifications.settingsTitle")} />
        <LoadingOverlay show={loading || saving} />

        {settings ? (
          <Card className="space-y-6 bg-paper/95 p-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">{t("notifications.channelsTitle")}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={settings.notifyInApp}
                    onChange={(event) => updateSetting("notifyInApp", event.target.checked)}
                    className="h-4 w-4 rounded border-ink/20 text-ocean focus:ring-ocean/30"
                  />
                  {t("notifications.channelInApp")}
                </label>
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={settings.notifyEmail}
                    onChange={(event) => updateSetting("notifyEmail", event.target.checked)}
                    className="h-4 w-4 rounded border-ink/20 text-ocean focus:ring-ocean/30"
                  />
                  {t("notifications.channelEmail")}
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">{t("notifications.eventsTitle")}</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={settings.enableExecutionRejected}
                    onChange={(event) => updateSetting("enableExecutionRejected", event.target.checked)}
                    className="h-4 w-4 rounded border-ink/20 text-ocean focus:ring-ocean/30"
                  />
                  {t("notifications.executionRejected")}
                </label>
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={settings.enableInviteAccepted}
                    onChange={(event) => updateSetting("enableInviteAccepted", event.target.checked)}
                    className="h-4 w-4 rounded border-ink/20 text-ocean focus:ring-ocean/30"
                  />
                  {t("notifications.inviteAccepted")}
                </label>
                <label className="flex items-center gap-2 text-sm text-ink/70">
                  <input
                    type="checkbox"
                    checked={settings.enableDeadlineExceeded}
                    onChange={(event) => updateSetting("enableDeadlineExceeded", event.target.checked)}
                    className="h-4 w-4 rounded border-ink/20 text-ocean focus:ring-ocean/30"
                  />
                  {t("notifications.deadlineExceeded")}
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-ink">{t("notifications.deadlineConfigTitle")}</h2>
              <label className="flex items-center gap-2 text-sm text-ink/70">
                <input
                  type="checkbox"
                  checked={settings.enableDeadlineWarning}
                  onChange={(event) => updateSetting("enableDeadlineWarning", event.target.checked)}
                  className="h-4 w-4 rounded border-ink/20 text-ocean focus:ring-ocean/30"
                />
                {t("notifications.deadlineWarning")}
              </label>
              <Field label={t("notifications.deadlineWarningDays")}>
                <Input
                  type="number"
                  min={0}
                  value={settings.deadlineWarningDays}
                  onChange={(event) => updateSetting("deadlineWarningDays", Number(event.target.value))}
                />
              </Field>
            </div>

            <div className="flex justify-end">
              <Button type="button" onClick={handleSubmit}>
                {t("common.save")}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
            {t("common.loading")}
          </div>
        )}
      </div>
    </PainelContainer>
  );
};

export default ProjectNotificationSettings;
