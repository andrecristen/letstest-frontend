import React from 'react';
import { getInvolvementInvitations, getInvolvementApplied } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum } from '../../models/InvolvementData';
import PainelContainer from '../../components/PainelContainer';
import LoadingOverlay from '../../components/LoadingOverlay';
import InvolvementPendingList from './InvolvementPendingList';
import TitleContainer from '../../components/TitleContainer';
import notifyProvider from '../../infra/notifyProvider';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';

const InvolvementPendingView: React.FC = () => {
    const { t } = useTranslation();
    const {
        items: invitations,
        loading: loadingInvitations,
        loadingMore: loadingMoreInvitations,
        hasNext: hasNextInvitations,
        sentinelRef: invitationsRef,
        reload: reloadInvitations,
    } = useInfiniteList<InvolvementData>(
        async (page, limit) => {
            try {
                const response = await getInvolvementInvitations(page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("involvement.loadError"));
                return null;
            }
        },
        []
    );

    const {
        items: applies,
        loading: loadingApplies,
        loadingMore: loadingMoreApplies,
        hasNext: hasNextApplies,
        sentinelRef: appliesRef,
        reload: reloadApplies,
    } = useInfiniteList<InvolvementData>(
        async (page, limit) => {
            try {
                const response = await getInvolvementApplied(page, limit);
                return response?.data ?? null;
            } catch (error) {
                notifyProvider.error(t("involvement.loadError"));
                return null;
            }
        },
        []
    );

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingInvitations || loadingApplies || loadingMoreInvitations || loadingMoreApplies} />
            <div className="space-y-6">
                <TitleContainer title={t("involvement.pendingTitle")} />
                <InvolvementPendingList callback={reloadInvitations} typeSituation={InvolvementSituationEnum.Received} involvements={invitations} />
                {hasNextInvitations ? <div ref={invitationsRef} /> : null}
                <InvolvementPendingList callback={reloadApplies} typeSituation={InvolvementSituationEnum.Sent} involvements={applies} />
                {hasNextApplies ? <div ref={appliesRef} /> : null}
            </div>
        </PainelContainer>
    );
};

export default InvolvementPendingView;
