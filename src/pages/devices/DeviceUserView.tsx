import React, { useMemo, useState } from 'react';
import PainelContainer from '../../components/PainelContainer';
import DeviceForm from './DeviceForm';
import DeviceList from './DeviceList';
import LoadingOverlay from '../../components/LoadingOverlay';
import { DeviceData, getDeviceTypeList } from '../../models/DeviceData';
import { getMy } from '../../services/deviceService';
import TitleContainer from '../../components/TitleContainer';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { Button, Field, Input, Select } from '../../ui';
import { FiFilter, FiXCircle } from 'react-icons/fi';

const DeviceUserView: React.FC = () => {

    const { t } = useTranslation();
    const deviceTypes = getDeviceTypeList();
    const [filters, setFilters] = useState<{ search: string; type: number | null }>({
        search: '',
        type: null,
    });
    const [filterDraft, setFilterDraft] = useState(filters);
    const {
        items: devices,
        loading,
        loadingMore,
        hasNext,
        sentinelRef,
        reload,
    } = useInfiniteList<DeviceData>(
        async (page, limit) => {
            try {
                const response = await getMy(page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("devices.loadError"));
                return null;
            }
        },
        []
    );

    const filteredDevices = useMemo(() => {
        return devices.filter((device) => {
            const searchValue = filters.search.toLowerCase();
            const matchesSearch = filters.search
                ? device.model.toLowerCase().includes(searchValue) ||
                  device.brand.toLowerCase().includes(searchValue) ||
                  device.system.toLowerCase().includes(searchValue)
                : true;
            const matchesType = filters.type ? device.type === filters.type : true;
            return matchesSearch && matchesType;
        });
    }, [devices, filters.search, filters.type]);

    const applyFilters = () => {
        setFilters(filterDraft);
    };

    const clearFilters = () => {
        const reset = { search: '', type: null };
        setFilterDraft(reset);
        setFilters(reset);
    };

    return (
        <PainelContainer>
            <LoadingOverlay show={loading || loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("devices.myTitle")} />

                <div className="flex flex-wrap items-center justify-end">
                    <DeviceForm onDeviceAdded={reload} variant="compact" />
                </div>

                <div className="w-full rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        <Field label={t("devices.searchLabel")}>
                            <Input
                                type="text"
                                placeholder={t("devices.searchPlaceholder")}
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
                                {deviceTypes.map((type) => (
                                    <option key={`type-${type.id}`} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </Select>
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

                <DeviceList devices={filteredDevices} onDelete={reload} />
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default DeviceUserView;
