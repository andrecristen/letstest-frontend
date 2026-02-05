import React, { useMemo, useState } from 'react';
import ListLayout from '../../components/ListLayout';
import HabilityForm from './HabilityForm';
import HabilityList from './HabilityList';
import { HabilityData, getHabilityTypeList } from '../../models/HabilityData';
import { getMy } from '../../services/habilityService';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { Field, Input, Select } from '../../ui';
import { usePageLoading } from '../../hooks/usePageLoading';

const HabilityUserView: React.FC = () => {
    
    const { t } = useTranslation();
    const habilityTypes = getHabilityTypeList();
    const [filters, setFilters] = useState<{ search: string; type: number | null }>({
        search: '',
        type: null,
    });
    const [filterDraft, setFilterDraft] = useState(filters);
    const {
        items: habilities,
        loading,
        loadingInitial,
        loadingMore,
        hasNext,
        sentinelRef,
        reload,
    } = useInfiniteList<HabilityData>(
        async (page, limit) => {
            try {
                const response = await getMy(page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("habilities.loadError"));
                return null;
            }
        },
        []
    );

    const filteredHabilities = useMemo(() => {
        return habilities.filter((hability) => {
            const matchesSearch = filters.search
                ? hability.value.toLowerCase().includes(filters.search.toLowerCase())
                : true;
            const matchesType = filters.type ? hability.type === filters.type : true;
            return matchesSearch && matchesType;
        });
    }, [habilities, filters.search, filters.type]);

    const applyFilters = () => {
        setFilters(filterDraft);
    };

    const clearFilters = () => {
        const reset = { search: '', type: null };
        setFilterDraft(reset);
        setFilters(reset);
    };

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("habilities.myTitle")}
            actions={<HabilityForm onHabilityAdded={reload} variant="compact" />}
            filters={(
                <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                    <Field label={t("habilities.searchLabel")}>
                        <Input
                            type="text"
                            placeholder={t("habilities.searchPlaceholder")}
                            value={filterDraft.search}
                            onChange={(event) => setFilterDraft((prev) => ({ ...prev, search: event.target.value }))}
                        />
                    </Field>
                    <Field label={t("common.typeLabel")}>
                        <Select
                            value={filterDraft.type ?? ""}
                            onChange={(event) =>
                                setFilterDraft((prev) => ({
                                    ...prev,
                                    type: event.target.value ? parseInt(event.target.value, 10) : null,
                                }))
                            }
                        >
                            <option value="">{t("common.all")}</option>
                            {habilityTypes.map((type) => (
                                <option key={`type-${type.id}`} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </Select>
                    </Field>
                </div>
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("common.loading")}
            loadingMore={loadingMore}
            empty={filteredHabilities.length === 0}
            emptyMessage={t("habilities.empty")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <HabilityList habilities={filteredHabilities} onDelete={reload} />
        </ListLayout>
    );
};

export default HabilityUserView;
