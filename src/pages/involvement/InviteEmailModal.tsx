import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiMail } from "react-icons/fi";
import LoadingOverlay from "../../components/LoadingOverlay";
import { InvolvementTypeEnum } from "../../models/InvolvementData";
import { invite } from "../../services/involvementService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input, Modal } from "../../ui";

type InviteEmailModalProps = {
  open: boolean;
  onClose: () => void;
  projectId: number;
  type: InvolvementTypeEnum;
  onInvited?: () => void;
};

const InviteEmailModal: React.FC<InviteEmailModalProps> = ({ open, onClose, projectId, type, onInvited }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      notifyProvider.info(t("involvement.inviteMissingEmail"));
      return;
    }

    setInviting(true);
    try {
      const response = await invite(projectId, email, type);
      if (response?.status === 201) {
        notifyProvider.success(t("involvement.inviteSuccess"));
        setEmail("");
        onInvited?.();
        onClose();
      } else {
        notifyProvider.error(t("involvement.inviteError"));
      }
    } catch (error) {
      notifyProvider.error(t("involvement.inviteError"));
    } finally {
      setInviting(false);
    }
  };

  return (
    <>
      <LoadingOverlay show={inviting} />
      <Modal open={open} onClose={onClose} className="max-w-lg">
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-display text-xl text-ink">{t("involvement.inviteEmailTitle")}</h3>
            <p className="text-sm text-ink/60">{t("involvement.inviteEmailHelp")}</p>
          </div>
          <Field label={t("involvement.inviteEmailLabel")}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("involvement.invitePlaceholder")}
                />
              </div>
              <Button
                type="button"
                className="sm:ml-auto"
                variant="primary"
                leadingIcon={<FiMail />}
                onClick={handleInvite}
                disabled={inviting}
              >
                {t("involvement.inviteButton")}
              </Button>
            </div>
          </Field>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InviteEmailModal;
