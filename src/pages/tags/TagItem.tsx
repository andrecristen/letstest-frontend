import React from "react";
import { FiEdit, FiEye, FiFileText } from "react-icons/fi";
import { TagData } from "../../models/TagData";
import { Button, Card } from "../../ui";
import { useTranslation } from "react-i18next";

interface TagItemProps {
    tag: TagData
    onEdit?: () => void;
    onView?: () => void;
}

const TagItem: React.FC<TagItemProps> = ({ tag, onEdit, onView }) => {
    const { t } = useTranslation();
    return (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                    <FiFileText className="h-5 w-5" />
                </span>
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                        #{tag.id}
                    </p>
                    <p className="font-display text-lg text-ink">{tag.name}</p>
                    {tag.commentary ? (
                        <p className="mt-2 text-sm text-ink/60">
                            {tag.commentary}
                        </p>
                    ) : (
                        <p className="mt-2 text-sm text-ink/40">{t("common.noComment")}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {onEdit ? (
                    <Button onClick={onEdit} variant="outline" size="sm" leadingIcon={<FiEdit />}>
                        {t("common.edit")}
                    </Button>
                ) : null}

                {onView ? (
                    <Button onClick={onView} variant="primary" size="sm" leadingIcon={<FiEye />}>
                        {t("common.view")}
                    </Button>
                ) : null}
            </div>
        </Card>
    );
};

export default TagItem;
