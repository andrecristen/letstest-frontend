import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import TagItem from "./TagItem";
import { TagData } from "../../models/TagData";
import { getTagsByProject } from "../../services/tagService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiPlus, FiXCircle } from "react-icons/fi";

const TagList: React.FC = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const {
        items: tags,
        loading: loadingTags,
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

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("tags.listTitle")} />

                <div className="flex flex-wrap items-end justify-end gap-4">
                    <Button type="button" onClick={handleNewTag} leadingIcon={<FiPlus />}>
                        {t("tags.createNew")}
                    </Button>
                </div>

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
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
                    <div className="flex w-full justify-end gap-2 pt-2">
                        <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                            {t("common.confirm")}
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                            {t("common.clearFilters")}
                        </Button>
                    </div>
                </div>

                {loadingTags ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("tags.loadingList")}
                    </div>
                ) : filteredTags.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("tags.emptyList")}
                    </div>
                ) : (
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
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default TagList;
