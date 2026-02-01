import React from 'react';
import PainelContainer from '../../components/PainelContainer';
import HabilityForm from './HabilityForm';
import HabilityList from './HabilityList';
import LoadingOverlay from '../../components/LoadingOverlay';
import { HabilityData } from '../../models/HabilityData';
import { getMy } from '../../services/habilityService';
import TitleContainer from '../../components/TitleContainer';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';

const HabilityUserView: React.FC = () => {
    
    const { t } = useTranslation();
    const {
        items: habilities,
        loading,
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

    return (
        <PainelContainer>
            <LoadingOverlay show={loading || loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={t("habilities.myTitle")} />
            <HabilityForm onHabilityAdded={reload} />
            <HabilityList habilities={habilities} onDelete={reload} />
            {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default HabilityUserView;
