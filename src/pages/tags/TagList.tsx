import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListLayout from "../../components/ListLayout";
import TagItem from "./TagItem";
import { TagData } from "../../models/TagData";
import { getTagsByProject } from "../../services/tagService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { FiPlus } from "react-icons/fi";
import { usePageLoading } from "../../hooks/usePageLoading";

const TagList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: tags,
        loading: loadingTags,
        loadingInitial,
        loadingMore,
        hasNext,
        sentinelRef,
    } = useInfiniteList<TagData>(
        async (page, limit) => {
            try {
                const response = await getTagsByProject(parseInt(projectId || "0", 10), page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("tags.loadError"));
                return null;
            }
        },
        [projectId],
        { enabled: Boolean(projectId) }
    );

    const filteredTags = useMemo(() => {
        return tags.filter((tag) =>
            tag.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tags, searchTerm]);

    const handleNewTag = () => {
        navigate(`/project/tags/${projectId}/add`);
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
            title={t("tags.listTitle")}
            actions={(
                <Button type="button" onClick={handleNewTag} leadingIcon={<FiPlus />}>
                    {t("tags.createNew")}
                </Button>
            )}
            filters={(
                <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <Field label={t("tags.searchLabel")}>
                        <Input
                            type="text"
                            placeholder={t("tags.searchPlaceholder")}
                            value={filterDraft}
                            onChange={(e) => setFilterDraft(e.target.value)}
                        />
                    </Field>
                </div>
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("tags.loadingList")}
            loadingMore={loadingMore}
            empty={filteredTags.length === 0}
            emptyMessage={t("tags.emptyList")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <div className="space-y-4">
                {filteredTags.map((tag) => (
                    <TagItem
                        key={tag.id}
                        tag={tag}
                        onView={() => navigate(`/project/tags/${projectId}/view/${tag.id}`)}
                        onEdit={() => navigate(`/project/tags/${projectId}/edit/${tag.id}`)}
                    />
                ))}
            </div>
        </ListLayout>
    );
};

export default TagList;
