import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import EnvironmentItem from "./EnvironmentItem";
import ListLayout from "../../components/ListLayout";
import { EnvironmentData } from "../../models/EnvironmentData";
import { getAllByProjects } from "../../services/environmentService";
import EnvironmentForm from "./EnvironmentForm";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import { FiPlus } from "react-icons/fi";
import { usePageLoading } from "../../hooks/usePageLoading";

const EnvironmentList: React.FC = () => {

    const { t } = useTranslation();
    const { projectId } = useParams();
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterDraft, setFilterDraft] = useState(searchTerm);
    const formDialogRef = useRef<FormDialogBaseExtendsRef>(null);

    const getProjectId = () => {
        return parseInt(projectId || "0", 10);
    }

    const {
        items: environments,
        loadingInitial,
        loadingMore,
        hasNext,
        sentinelRef,
        reload,
    } = useInfiniteList<EnvironmentData>(
        async (page, limit) => {
            try {
                const response = await getAllByProjects(getProjectId(), page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("environment.loadError"));
                return null;
            }
        },
        [projectId],
        { enabled: Boolean(projectId) }
    );

    const filteredEnvironments = useMemo(() => {
        return environments.filter((environment) =>
            environment.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [environments, searchTerm]);

    const handleClickNewEnvironment = () => {
        formDialogRef.current?.setData({});
        formDialogRef.current?.openDialog();
    };

    const handleClickEnvironment = (environment: EnvironmentData) => {
        formDialogRef.current?.setData(environment);
        formDialogRef.current?.openDialog();
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
            title={t("environment.listTitle")}
            actions={(
                <Button type="button" onClick={handleClickNewEnvironment} leadingIcon={<FiPlus />}>
                    {t("environment.createNew")}
                </Button>
            )}
            filters={(
                <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <Field label={t("environment.searchLabel")}>
                        <Input
                            type="text"
                            placeholder={t("environment.searchPlaceholder")}
                            value={filterDraft}
                            onChange={(e) => setFilterDraft(e.target.value)}
                        />
                    </Field>
                </div>
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("environment.loadingList")}
            loadingMore={loadingMore}
            empty={filteredEnvironments.length === 0}
            emptyMessage={t("environment.emptyList")}
            footer={(
                <>
                    {hasNext ? <div ref={sentinelRef} /> : null}
                    <EnvironmentForm projectId={getProjectId()} ref={formDialogRef} callbackSubmit={reload} />
                </>
            )}
        >
            <div className="grid grid-cols-1 gap-4">
                {filteredEnvironments.map((environment) => (
                    <EnvironmentItem
                        key={environment.id}
                        environment={environment}
                        onEdit={() => handleClickEnvironment(environment)}
                    />
                ))}
            </div>
        </ListLayout>
    );
};

export default EnvironmentList;
