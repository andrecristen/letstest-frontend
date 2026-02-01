import React from "react";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import LoadingOverlay from "../../components/LoadingOverlay";
import { getInvolvementApplied } from "../../services/involvementService";
import { InvolvementData, InvolvementSituationEnum } from "../../models/InvolvementData";
import InvolvementPendingList from "./InvolvementPendingList";
import notifyProvider from "../../infra/notifyProvider";
import { useTranslation } from "react-i18next";
import { useInfiniteList } from "../../hooks/useInfiniteList";

const InvolvementRequestsView: React.FC = () => {
  const { t } = useTranslation();
  const {
    items: applies,
    loading: loadingInvolvements,
    loadingMore,
    hasNext,
    sentinelRef,
    reload,
  } = useInfiniteList<InvolvementData>(
    async (page, limit) => {
      try {
        const responseApplies = await getInvolvementApplied(page, limit);
        return responseApplies?.data ?? null;
      } catch (error) {
        notifyProvider.error(t("involvement.requestsLoadError"));
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
          title={t("involvement.requestsTitle")}
          textHelp={t("involvement.requestsHelp")}
        />
        <InvolvementPendingList
          callback={reload}
          typeSituation={InvolvementSituationEnum.Sent}
          involvements={applies}
        />
        {hasNext ? <div ref={sentinelRef} /> : null}
      </div>
    </PainelContainer>
  );
};

export default InvolvementRequestsView;
