import React from "react";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import { getInvolvementInvitations } from "../../services/involvementService";
import { InvolvementData, InvolvementSituationEnum } from "../../models/InvolvementData";
import InvolvementPendingList from "./InvolvementPendingList";
import notifyProvider from "../../infra/notifyProvider";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";

const InvolvementInvitationsView: React.FC = () => {
  const { t } = useTranslation();
  const {
    items: invitations,
    loading: loadingInvolvements,
    loadingMore,
    hasNext,
    sentinelRef,
    reload,
  } = useInfiniteList<InvolvementData>(
    async (page, limit) => {
      try {
        const responseInvitations = await getInvolvementInvitations(page, limit);
        return responseInvitations?.data ?? null;
      } catch (error) {
        notifyProvider.error(t("involvement.invitationsLoadError"));
        return null;
      }
    },
    []
  );

  return (
    <PainelContainer>
      <LoadingOverlay show={loadingInvolvements || loadingMore} />
      <div className="space-y-6">
        <TitleContainer
          title={t("involvement.invitationsTitle")}
          textHelp={t("involvement.invitationsHelp")}
        />
        <InvolvementPendingList
          callback={reload}
          typeSituation={InvolvementSituationEnum.Received}
          involvements={invitations}
        />
        {hasNext ? <div ref={sentinelRef} /> : null}
      </div>
    </PainelContainer>
  );
};

export default InvolvementInvitationsView;
