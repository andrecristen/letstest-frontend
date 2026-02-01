import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import TemplateItem from "./TemplateItem";
import { TemplateData } from "../../models/TemplateData";
import { getAllByProject } from "../../services/templatesService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiPlus, FiXCircle } from "react-icons/fi";

const TemplateList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: templates,
        loading: loadingTemplates,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<TemplateData>(
        async (page, limit) => {
            try {
                const response = await getAllByProject(parseInt(projectId || "0", 10), page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("templates.loadError"));
                return null;
            }
        },
        [projectId],
        { enabled: Boolean(projectId) }
    );

    const filteredTemplates = useMemo(() => {
        return templates.filter((template) =>
            template.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [templates, searchTerm]);

    const handleNewTemplate = () => {
        navigate(`/project/templates/${projectId}/add`);
    };

    const applyFilters = () => {
        setSearchTerm(filterDraft);
    };

    const clearFilters = () => {
        setFilterDraft("");
        setSearchTerm("");
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("templates.listTitle")} />

                <div className="flex flex-wrap items-end justify-end gap-4">
                    <Button type="button" onClick={handleNewTemplate} leadingIcon={<FiPlus />}>
                        {t("templates.createNew")}
                    </Button>
                </div>

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        <Field label={t("templates.searchLabel")}>
                            <Input
                                type="text"
                                placeholder={t("templates.searchPlaceholder")}
                                value={filterDraft}
                                onChange={(e) => setFilterDraft(e.target.value)}
                            />
                        </Field>
                    </div>
                    <div className="flex w-full justify-end gap-2 pt-2">
                        <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                            {t("common.confirm")}
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                            {t("common.clearFilters")}
                        </Button>
                    </div>
                </div>

                {loadingTemplates ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("templates.loadingList")}
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("templates.emptyList")}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTemplates.map((template) => (
                            <TemplateItem
                                key={template.id}
                                template={template}
                                onDuplicate={() => navigate(`/project/templates/${projectId}/copy/${template.id}`)}
                                onView={() => navigate(`/project/templates/${projectId}/view/${template.id}`)}
                            />
                        ))}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default TemplateList;
