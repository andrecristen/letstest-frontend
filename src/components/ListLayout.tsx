import React from "react";
import PainelContainer from "./PainelContainer";
import TitleContainer from "./TitleContainer";
import { Button } from "../ui";
import { FiFilter, FiXCircle } from "react-icons/fi";
import { useTranslation } from "react-i18next";

type ListLayoutProps = {
  title: string;
  textHelp?: string;
  actions?: React.ReactNode;
  extraActions?: React.ReactNode;
  filters?: React.ReactNode;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
  loading?: boolean;
  loadingMessage?: string;
  loadingMore?: boolean;
  loadingMoreMessage?: string;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const ListLayout: React.FC<ListLayoutProps> = ({
  title,
  textHelp,
  actions,
  extraActions,
  filters,
  onApplyFilters,
  onClearFilters,
  loading,
  loadingMessage,
  loadingMore,
  loadingMoreMessage,
  empty,
  emptyMessage,
  children,
  footer,
}) => {
  const { t } = useTranslation();

  return (
    <PainelContainer>
      <div className="space-y-6">
        <TitleContainer title={title} textHelp={textHelp} />

        {(actions || extraActions) && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">{extraActions}</div>
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </div>
        )}

        {filters && (
          <div className="w-full rounded-3xl border border-ink/10 bg-paper/80 p-4 shadow-soft">
            {filters}
            {(onApplyFilters || onClearFilters) && (
              <div className="flex w-full justify-end gap-2 pt-2">
                {onApplyFilters && (
                  <Button type="button" variant="primary" onClick={onApplyFilters} leadingIcon={<FiFilter />}>
                    {t("common.confirm")}
                  </Button>
                )}
                {onClearFilters && (
                  <Button type="button" variant="outline" onClick={onClearFilters} leadingIcon={<FiXCircle />}>
                    {t("common.clearFilters")}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-ink/10 bg-paper/80 p-10 text-center text-sm text-ink/60 shadow-soft">
            {loadingMessage ?? t("common.loading")}
          </div>
        ) : empty ? (
          <div className="rounded-3xl border border-ink/10 bg-paper/80 p-10 text-center text-sm text-ink/60 shadow-soft">
            {emptyMessage ?? t("common.noComment")}
          </div>
        ) : (
          children
        )}

        {loadingMore && !loading ? (
          <div className="rounded-2xl border border-ink/10 bg-paper/80 px-4 py-3 text-center text-xs text-ink/60 shadow-soft">
            {loadingMoreMessage ?? t("common.loading")}
          </div>
        ) : null}

        {footer}
      </div>
    </PainelContainer>
  );
};

export default ListLayout;
