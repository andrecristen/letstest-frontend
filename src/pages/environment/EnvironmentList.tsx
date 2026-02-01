import React, { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import EnvironmentItem from "./EnvironmentItem";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { EnvironmentData } from "../../models/EnvironmentData";
import { getAllByProjects } from "../../services/environmentService";
import EnvironmentForm from "./EnvironmentForm";
import { FormDialogBaseExtendsRef } from "../../components/FormDialogBase";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Field, Input } from "../../ui";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";
import LoadingOverlay from "../../components/LoadingOverlay";
import { FiFilter, FiPlus, FiXCircle } from "react-icons/fi";

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
        loading: loadingEnvironments,
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

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("environment.listTitle")} />
                <div className="flex flex-wrap items-end justify-end gap-4">
                    <Button type="button" onClick={handleClickNewEnvironment} leadingIcon={<FiPlus />}>
                        {t("environment.createNew")}
                    </Button>
                </div>

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
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
                    <div className="flex w-full justify-end gap-2 pt-2">
                        <Button type="button" variant="primary" onClick={applyFilters} leadingIcon={<FiFilter />}>
                            {t("common.confirm")}
                        </Button>
                        <Button type="button" variant="outline" onClick={clearFilters} leadingIcon={<FiXCircle />}>
                            {t("common.clearFilters")}
                        </Button>
                    </div>
                </div>
                {loadingEnvironments ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("environment.loadingList")}
                    </div>
                ) : filteredEnvironments.length === 0 ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("environment.emptyList")}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredEnvironments.map((environment) => (
                            <EnvironmentItem
                                key={environment.id}
                                environment={environment}
                                onEdit={() => handleClickEnvironment(environment)}
                            />
                        ))}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
                <EnvironmentForm projectId={getProjectId()} ref={formDialogRef} callbackSubmit={reload} />
            </div>
        </PainelContainer>
    );
};

export default EnvironmentList;
