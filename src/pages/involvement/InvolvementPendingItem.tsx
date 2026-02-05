import React from "react";
import { FiUserCheck, FiUserX, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { accept, reject, remove } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum, getInvolvementTypeDescription } from "../../models/InvolvementData";
import { getProjectSituationDescription } from '../../models/ProjectData';
import logo from '../../assets/logo-transparente.png';
import notifyProvider from "../../infra/notifyProvider";
import { Badge, Button, Card } from "../../ui";
import { useTranslation } from "react-i18next";

interface InvolvementPendingItemProps {
    involvement: InvolvementData;
    typeSituation: InvolvementSituationEnum;
    callback: () => void;
}

const InvolvementPendingItem: React.FC<InvolvementPendingItemProps> = ({ involvement, typeSituation, callback }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleClickProfileUser = () => {
        navigate("/profile/" + involvement.project?.creator?.id);
    }

    const handleClickAccept = async () => {
        const response = await accept(involvement.id);
        if (response?.status !== 200) {
            notifyProvider.error(t("involvement.acceptError"));
        } else {
            callback();
        }
    }

    const handleClickReject = async () => {
        const response = await reject(involvement.id);
        if (response?.status !== 200) {
            notifyProvider.error(t("involvement.rejectError"));
        } else {
            callback();
        }
    }

    const handleClickRemove = async () => {
        const response = await remove(involvement.id);
        if (response?.status !== 200) {
            notifyProvider.error(t("involvement.removeError"));
        } else {
            callback();
        }
    }

    const getSituationVariant = (situation: number) => {
        switch (situation) {
            case 1:
                return "info";
            case 2:
                return "success";
            case 3:
                return "danger";
            default:
                return "neutral";
        }
    };

    return (
        <Card className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <Badge variant={getSituationVariant(involvement.project?.situation || 0)}>
                        {getProjectSituationDescription(involvement.project?.situation || 0)}
                    </Badge>
                    <h3 className="font-display text-lg text-ink">
                        #{involvement.project?.id} · {involvement.project?.name}
                    </h3>
                    <p className="text-sm text-ink/60">
                        {t("common.typeLabel")}: {getInvolvementTypeDescription(involvement.type)}
                    </p>
                    <p className="text-sm text-ink/60">
                        {involvement.project?.description}
                    </p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-paper/80 p-3">
                    <img src={logo} alt={t("common.appName")} className="h-10 w-10 rounded-full bg-gray-50" />
                    <div className="text-sm">
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">{t("involvement.creatorLabel")}</p>
                        <button
                            type="button"
                            className="font-semibold text-ocean hover:text-ink"
                            onClick={handleClickProfileUser}
                        >
                            {involvement.project?.creator?.name}
                        </button>
                    </div>
                </div>
            </div>
            {typeSituation === InvolvementSituationEnum.Received ? (
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="accent"
                        leadingIcon={<FiUserCheck />}
                        onClick={handleClickAccept}
                    >
                        {t("involvement.accept")}
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        leadingIcon={<FiUserX />}
                        onClick={handleClickReject}
                    >
                        {t("involvement.reject")}
                    </Button>
                </div>
            ) : null}
            {typeSituation === InvolvementSituationEnum.Sent ? (
                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="danger"
                        leadingIcon={<FiTrash />}
                        onClick={handleClickRemove}
                    >
                        {t("involvement.cancelRequest")}
                    </Button>
                </div>
            ) : null}
        </Card>
    );
};

export default InvolvementPendingItem;
