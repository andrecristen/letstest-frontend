import React from 'react';
import { FiCopy, FiFileText, FiEye } from 'react-icons/fi';
import { TemplateData, getTemplateTypeDescription } from '../../models/TemplateData';
import { Button, Card } from "../../ui";
import { useTranslation } from 'react-i18next';

interface TemplateItemProps {
    template: TemplateData;
    onDuplicate: () => void;
    onView: () => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({ template, onDuplicate, onView }) => {
    const { t } = useTranslation();
    return (
        <Card className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                    <FiFileText className="h-5 w-5" />
                </span>
                <div className="space-y-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                        #{template.id}
                    </p>
                    <p className="font-display text-lg text-ink">{template.name}</p>
                    <p className="text-sm text-ink/60">{getTemplateTypeDescription(template.type)}</p>
                    <p className="text-sm text-ink/60">{template.description}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Button onClick={onDuplicate} variant="outline" size="sm" leadingIcon={<FiCopy />}>
                    {t("common.customize")}
                </Button>
                <Button onClick={onView} variant="primary" size="sm" leadingIcon={<FiEye />}>
                    {t("common.view")}
                </Button>
            </div>
        </Card>
    );
};

export default TemplateItem;
