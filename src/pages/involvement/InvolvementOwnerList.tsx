import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getByProjectAndSituation, accept, reject, remove } from '../../services/involvementService';
import { InvolvementData, InvolvementSituationEnum, InvolvementTypeEnum, getInvolvementSituationList, } from '../../models/InvolvementData';
import PainelContainer from '../../components/PainelContainer';
import TitleContainer from '../../components/TitleContainer';
import { FiCheckCircle, FiFilter, FiMail, FiSearch, FiUserX, FiTrash, FiUser, FiEye, FiXCircle } from 'react-icons/fi';
import notifyProvider from '../../infra/notifyProvider';
import { Button, Card, Field, Input, cn } from '../../ui';
import { useTranslation } from 'react-i18next';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import LoadingOverlay from '../../components/LoadingOverlay';
import InviteUserModal from './InviteUserModal';
import InviteEmailModal from './InviteEmailModal';

interface InvolvementManagementListProps {
    type: InvolvementTypeEnum;
    title: string;
}

const InvolvementOwnerList: React.FC<InvolvementManagementListProps> = ({ type, title }) => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [selectedSituation, setSelectedSituation] = useState<InvolvementSituationEnum>(InvolvementSituationEnum.Accepted);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filterDraft, setFilterDraft] = useState<{ search: string; situation: InvolvementSituationEnum }>({
        search: '',
        situation: InvolvementSituationEnum.Accepted,
    });
    const [inviteSearchOpen, setInviteSearchOpen] = useState(false);
    const [inviteEmailOpen, setInviteEmailOpen] = useState(false);

    let situations = getInvolvementSituationList();
    if (type === InvolvementTypeEnum.Manager) {
        situations = situations.filter((situation) => situation.id !== InvolvementSituationEnum.Received);
    }

    const {
        items: involvements,
        loading: loadingInvolvements,
        loadingMore,
        hasNext,
        sentinelRef,
        reload,
    } = useInfiniteList<InvolvementData>(
        async (page, limit) => {
            try {
                const response = await getByProjectAndSituation(
                    parseInt(projectId || '0', 10),
                    selectedSituation,
                    page,
                    limit,
                    searchTerm
                );
                const data = response?.data?.data ?? [];
                return response?.data ? { ...response.data, data: data.filter((involvement: InvolvementData) => involvement.type === type) } : null;
            } catch (error) {
                notifyProvider.error(t('involvement.ownerLoadError'));
                return null;
            }
        },
        [selectedSituation, searchTerm, type, projectId],
        { enabled: Boolean(projectId) }
    );

    const handleSituationChange = (situationId: InvolvementSituationEnum | null) => {
        if (situationId) {
            setFilterDraft((prev) => ({ ...prev, situation: situationId }));
            setSelectedSituation(situationId);
        }
    };

    const applyFilters = () => {
        setSelectedSituation(filterDraft.situation);
        setSearchTerm(filterDraft.search);
    };

    const clearFilters = () => {
        setFilterDraft({ search: '', situation: InvolvementSituationEnum.Accepted });
        setSelectedSituation(InvolvementSituationEnum.Accepted);
        setSearchTerm('');
    };

    const handleRemove = async (involvement: InvolvementData) => {
        await remove(involvement.id);
        reload();
    }

    const handleAccept = async (involvement: InvolvementData) => {
        await accept(involvement.id);
        setSelectedSituation(InvolvementSituationEnum.Accepted);
    }

    const handleReject = async (involvement: InvolvementData) => {
        await reject(involvement.id);
        setSelectedSituation(InvolvementSituationEnum.Rejected);
    }

    const handleView = async (involvement: InvolvementData) => {
        navigate("/profile/" + involvement.user?.id);
    }

    const renderInvolvementCard = (involvement: InvolvementData) => (
        <Card key={involvement.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <span className="rounded-full border border-ink/10 bg-paper p-2 text-ink/70">
                    <FiUser className="h-5 w-5" />
                </span>
                <div>
                    <p className="font-display text-lg text-ink">{involvement.user?.name}</p>
                    <p className="text-sm text-ink/60">{involvement.user?.email}</p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(involvement)}
                    leadingIcon={<FiEye />}
                >
                    {t('involvement.viewProfile')}
                </Button>
                {selectedSituation === InvolvementSituationEnum.Received && (
                    <>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(involvement)}
                            leadingIcon={<FiUserX />}
                        >
                            {t('involvement.reject')}
                        </Button>
                        <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleAccept(involvement)}
                            leadingIcon={<FiCheckCircle />}
                        >
                            {t('involvement.accept')}
                        </Button>
                    </>
                )}
                {selectedSituation !== InvolvementSituationEnum.Received && (
                    <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemove(involvement)}
                        leadingIcon={<FiTrash />}
                    >
                        {t('common.remove')}
                    </Button>
                )}
            </div>
        </Card>
    );

    return (
        <PainelContainer>
            <LoadingOverlay show={loadingMore} />
            <div className="space-y-6">
                <TitleContainer title={title} />

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button type="button" variant="outline" leadingIcon={<FiMail />} onClick={() => setInviteEmailOpen(true)}>
                        {t('involvement.inviteByEmail')}
                    </Button>
                    <Button type="button" variant="primary" leadingIcon={<FiSearch />} onClick={() => setInviteSearchOpen(true)}>
                        {t('involvement.inviteSearch')}
                    </Button>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl border border-ink/10 bg-paper/70 p-4">
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
                        <Field label={t("involvement.searchLabel")}>
                            <Input
                                type="text"
                                placeholder={t("involvement.searchPlaceholder")}
                                value={filterDraft.search}
                                onChange={(event) => setFilterDraft((prev) => ({ ...prev, search: event.target.value }))}
                            />
                        </Field>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {situations.map((situation) => (
                            <button
                                key={situation.id}
                                type="button"
                                aria-pressed={filterDraft.situation === situation.id}
                                className={cn(
                                    "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                                    filterDraft.situation === situation.id
                                        ? "border-ink bg-ink text-sand"
                                        : "border-ink/10 bg-paper text-ink/60 hover:border-ink/30 hover:text-ink"
                                )}
                                onClick={() => handleSituationChange(situation.id)}
                            >
                                {situation.name}
                            </button>
                        ))}
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

                {loadingInvolvements ? (
                    <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                        {t('involvement.loadingList')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {involvements.length > 0 ? (
                            involvements.map((involvement) => renderInvolvementCard(involvement))
                        ) : (
                            <div className="rounded-2xl border border-ink/10 bg-paper/70 p-10 text-center text-sm text-ink/60">
                                {selectedSituation === InvolvementSituationEnum.Received
                                    ? t('involvement.emptyReceived')
                                    : t('involvement.emptyForSituation')}
                            </div>
                        )}
                    </div>
                )}
                {hasNext ? <div ref={sentinelRef} /> : null}
            </div>
            {projectId ? (
                <>
                    <InviteEmailModal
                        open={inviteEmailOpen}
                        onClose={() => setInviteEmailOpen(false)}
                        projectId={parseInt(projectId, 10)}
                        type={type}
                        onInvited={reload}
                    />
                    <InviteUserModal
                        open={inviteSearchOpen}
                        onClose={() => setInviteSearchOpen(false)}
                        projectId={parseInt(projectId, 10)}
                        type={type}
                        onInvited={reload}
                    />
                </>
            ) : null}
        </PainelContainer>
    );
};

export default InvolvementOwnerList;
