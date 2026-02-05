import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListLayout from "../../components/ListLayout";
import TemplateItem from "./TemplateItem";
import { TemplateData } from "../../models/TemplateData";
import { getAllByProject } from "../../services/templatesService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { FiPlus } from "react-icons/fi";
import { usePageLoading } from "../../hooks/usePageLoading";

const TemplateList: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: templates,
        loadingInitial,
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

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("templates.listTitle")}
            actions={(
                <Button type="button" onClick={handleNewTemplate} leadingIcon={<FiPlus />}>
                    {t("templates.createNew")}
                </Button>
            )}
            filters={(
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
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("templates.loadingList")}
            loadingMore={loadingMore}
            empty={filteredTemplates.length === 0}
            emptyMessage={t("templates.emptyList")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
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
        </ListLayout>
    );
};

export default TemplateList;
