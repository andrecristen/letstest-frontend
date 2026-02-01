import React from 'react';
import { FiTrash, FiStar, FiSmile, FiGlobe, FiFile, FiBookOpen, FiAward } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import { HabilityData, getHabilityTypeDescription } from '../../models/HabilityData';
import { remove } from '../../services/habilityService';
import { Button, Card } from '../../ui';
import { useTranslation } from 'react-i18next';

interface HabilityListProps {
    habilities: HabilityData[];
    onDelete?: () => void;
}

const HabilityList: React.FC<HabilityListProps> = ({ habilities, onDelete }) => {
    const { t } = useTranslation();

    const handleDelete = async (hability: HabilityData) => {
        if (hability.id) {
            const response = await remove(hability.id);
            if (response?.status === 200) {
                notifyProvider.success(t("habilities.deleteSuccess"));
                if (onDelete) {
                    onDelete();
                }
            } else {
                notifyProvider.error(t("habilities.deleteError"));
            }
        }
    };

    const renderHabilityIcon = (type: number) => {
        switch (type) {
            case 1:
                return <FiStar className="text-purple-700 w-6 h-6" />;
            case 2:
                return <FiFile className="text-purple-700 w-6 h-6" />;
            case 3:
                return <FiBookOpen className="text-purple-700 w-6 h-6" />;
            case 4:
                return <FiGlobe className="text-purple-700 w-6 h-6" />;
            case 5:
                return <FiAward className="text-purple-700 w-6 h-6" />;
            default:
                return <FiSmile className="text-purple-700 w-6 h-6" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {habilities.length > 0 ? (
                    habilities.map(hability => (
                        <Card
                            key={hability.id}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                                    {renderHabilityIcon(hability.type)}
                                </span>
                                <div>
                                    <p className="font-display text-lg text-ink">{hability.value}</p>
                                    <p className="text-sm text-ink/60">{t("common.typeLabel")}: {getHabilityTypeDescription(hability.type)}</p>
                                </div>
                            </div>
                            {onDelete ? (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDelete(hability)}
                                    leadingIcon={<FiTrash />}
                                >
                                    {t("common.delete")}
                                </Button>
                            ) : null}
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t("habilities.empty")}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HabilityList;
