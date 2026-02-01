import React from 'react';
import { FiSmartphone, FiMonitor, FiTablet, FiWatch, FiTrash, FiImage, FiLayers } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import { DeviceData, getDeviceTypeDescription } from '../../models/DeviceData';
import { remove } from '../../services/deviceService';
import { Button, Card } from '../../ui';
import { useTranslation } from 'react-i18next';

interface DeviceListProps {
    devices: DeviceData[];
    onDelete?: () => void;
}

const DeviceList: React.FC<DeviceListProps> = ({ devices, onDelete }) => {
    const { t } = useTranslation();

    const handleDelete = async (device: DeviceData) => {
        if (device.id) {
            const response = await remove(device.id);
            if (response?.status === 200) {
                notifyProvider.success(t("devices.deleteSuccess"));
                if (onDelete) {
                    onDelete();
                }
            } else {
                notifyProvider.error(t("devices.deleteError"));
            }
        }
    };

    const renderDeviceIcon = (type: number) => {
        switch (type) {
            case 1:
                return <FiSmartphone className="text-purple-700 w-6 h-6" />;
            case 2:
                return <FiLayers className="text-purple-700 w-6 h-6" />;
            case 3:
                return <FiMonitor className="text-purple-700 w-6 h-6" />;
            case 4:
                return <FiTablet className="text-purple-700 w-6 h-6" />;
            case 5:
                return <FiWatch className="text-purple-700 w-6 h-6" />;
            default:
                return <FiImage className="text-purple-700 w-6 h-6" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {devices.length > 0 ? (
                    devices.map(device => (
                        <Card
                            key={device.id}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                                    {renderDeviceIcon(device.type)}
                                </span>
                                <div>
                                    <p className="font-display text-lg text-ink">{device.model}</p>
                                    <p className="text-sm text-ink/60">{t("common.typeLabel")}: {getDeviceTypeDescription(device.type)}</p>
                                    <p className="text-sm text-ink/60">{t("common.brandLabel")}: {device.brand}</p>
                                    <p className="text-sm text-ink/60">{t("common.systemLabel")}: {device.system}</p>
                                </div>
                            </div>
                            {onDelete ? (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(device)}
                                    leadingIcon={<FiTrash />}
                                >
                                    {t("common.delete")}
                                </Button>
                            ) : null}
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("devices.empty")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeviceList;
