import React from "react";
import { FiEdit, FiFileText } from "react-icons/fi";
import { EnvironmentData, getEnvironmentSituationDescription } from "../../models/EnvironmentData";
import { Badge, Button, Card } from "../../ui";
import { useTranslation } from "react-i18next";

interface EnvironmentItemProps {
    environment: EnvironmentData;
    onEdit?: () => void;
}

const EnvironmentItem: React.FC<EnvironmentItemProps> = ({ environment, onEdit }) => {
    const { t } = useTranslation();
    return (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                    <FiFileText className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                        #{environment.id}
                    </p>
                    <p className="font-display text-lg text-ink">{environment.name}</p>
                    <Badge variant={environment.situation === 1 ? "success" : "danger"}>
                        {getEnvironmentSituationDescription(environment.situation)}
                    </Badge>
                    <p className="text-sm text-ink/60">{environment.description}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {onEdit ? (
                    <Button onClick={onEdit} variant="outline" size="sm" leadingIcon={<FiEdit />}>
                        {t("common.edit")}
                    </Button>
                ) : null}
            </div>
        </Card>
    );
};

export default EnvironmentItem;
