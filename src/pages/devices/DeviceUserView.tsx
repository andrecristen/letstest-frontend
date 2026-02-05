import React, { useMemo, useState } from 'react';
import ListLayout from '../../components/ListLayout';
import DeviceForm from './DeviceForm';
import DeviceList from './DeviceList';
import { DeviceData, getDeviceTypeList } from '../../models/DeviceData';
import { getMy } from '../../services/deviceService';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { Field, Input, Select } from '../../ui';
import { usePageLoading } from '../../hooks/usePageLoading';

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
        loadingInitial,
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

    usePageLoading(loadingInitial);

    return (
        <ListLayout
            title={t("devices.myTitle")}
            actions={<DeviceForm onDeviceAdded={reload} variant="compact" />}
            filters={(
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
            )}
            onApplyFilters={applyFilters}
            onClearFilters={clearFilters}
            loading={loadingInitial}
            loadingMessage={t("common.loading")}
            loadingMore={loadingMore}
            empty={filteredDevices.length === 0}
            emptyMessage={t("devices.empty")}
            footer={<>{hasNext ? <div ref={sentinelRef} /> : null}</>}
        >
            <DeviceList devices={filteredDevices} onDelete={reload} />
        </ListLayout>
    );
};

export default DeviceUserView;
