import React from 'react';
import PainelContainer from '../../components/PainelContainer';
import DeviceForm from './DeviceForm';
import DeviceList from './DeviceList';
import LoadingOverlay from '../../components/LoadingOverlay';
import { DeviceData } from '../../models/DeviceData';
import { getMy } from '../../services/deviceService';
import TitleContainer from '../../components/TitleContainer';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';

const DeviceUserView: React.FC = () => {

    const { t } = useTranslation();
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

    return (
        <PainelContainer>
            <LoadingOverlay show={loading || loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("devices.myTitle")} />
            <DeviceForm onDeviceAdded={reload} />
            <DeviceList devices={devices} onDelete={reload} />
            {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default DeviceUserView;
