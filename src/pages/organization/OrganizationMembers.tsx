import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiUserPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiClock, FiRefreshCw, FiMail } from "react-icons/fi";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as organizationService from "../../services/organizationService";
import type { OrganizationMember, PendingInvite } from "../../services/organizationService";
import { getUsage } from "../../services/billingService";
import type { BillingUsageSummary } from "../../models/BillingData";
import notifyProvider from "../../infra/notifyProvider";
import tokenProvider from "../../infra/tokenProvider";
import { requestConfirm } from "../../infra/confirmManager";
import { Button, Card, Field, Input, Select } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import Modal from "../../ui/Modal";

// Role options for editing - owner cannot be assigned via role edit
const EDITABLE_ROLE_OPTIONS = [
    { value: "member", label: "Membro" },
    { value: "admin", label: "Administrador" },
];

// All roles for display purposes
const ROLE_OPTIONS = [
    { value: "member", label: "Membro" },
    { value: "admin", label: "Administrador" },
    { value: "owner", label: "Proprietário" },
];

const OrganizationMembers: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentOrganization, canManage, isOwner } = useOrganization();
    const currentUserId = tokenProvider.getSessionUserId();

    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("member");
    const [isInviting, setIsInviting] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
    const [editingRole, setEditingRole] = useState("");
    const [resendingInviteId, setResendingInviteId] = useState<number | null>(null);
    const [usage, setUsage] = useState<BillingUsageSummary | null>(null);

    const loadMembers = useCallback(async () => {
        if (!currentOrganization) return;
        setIsLoading(true);
        try {
            const [membersResult, usageResult] = await Promise.allSettled([
                organizationService.getMembers(currentOrganization.id),
                getUsage(),
            ]);
            if (membersResult.status === "fulfilled") {
                const response = membersResult.value;
                if (response?.data) {
                    setMembers(response.data.members || []);
                    setPendingInvites(response.data.pendingInvites || []);
                }
            } else {
                notifyProvider.error(t("organization.loadMembersError"));
            }
            if (usageResult.status === "fulfilled") {
                setUsage(usageResult.value?.data ?? null);
            }
        } catch (error) {
            notifyProvider.error(t("organization.loadMembersError"));
        } finally {
            setIsLoading(false);
        }
    }, [currentOrganization, t]);

    useEffect(() => {
        if (currentOrganization && !canManage) {
            notifyProvider.error(t("organization.accessDenied"));
            navigate("/dashboard");
        }
    }, [currentOrganization, canManage, navigate, t]);

    useEffect(() => {
        if (canManage) {
            loadMembers();
        }
    }, [loadMembers, canManage]);

    const seatLimit = usage?.limits?.seats ?? null;
    const seatUsage = usage?.usage?.seats ?? members.length;
    const seatPending = pendingInvites.length;
    const seatCurrent = Math.max(seatUsage, members.length);
    const seatTotal = seatCurrent + seatPending;
    const canInviteMore = useMemo(() => {
        if (seatLimit === null) return true;
        return seatTotal < seatLimit;
    }, [seatLimit, seatTotal]);

    const handleInvite = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!currentOrganization) return;
        if (!canInviteMore) {
            notifyProvider.error(t("billing.limitDescription"));
            return;
        }

        setIsInviting(true);
        try {
            const response = await organizationService.inviteMember(currentOrganization.id, {
                email: inviteEmail,
                role: inviteRole,
            });
            if (response?.status === 402) {
                return;
            }
            if (response?.status === 201) {
                const message = response.data?.userExists
                    ? t("organization.inviteCreatedUserExists")
                    : t("organization.inviteSentByEmail");
                notifyProvider.success(message);
                setShowInviteModal(false);
                setInviteEmail("");
                setInviteRole("member");
                loadMembers();
            } else {
                notifyProvider.error(response?.data?.error || t("organization.inviteError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.inviteError"));
        } finally {
            setIsInviting(false);
        }
    };

    const handleUpdateRole = async (userId: number) => {
        if (!currentOrganization) return;

        try {
            const response = await organizationService.updateMemberRole(
                currentOrganization.id,
                userId,
                editingRole
            );
            if (response?.status === 200) {
                notifyProvider.success(t("organization.roleUpdated"));
                setEditingMemberId(null);
                loadMembers();
            } else {
                notifyProvider.error(t("organization.roleUpdateError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.roleUpdateError"));
        }
    };

    const handleRemoveMember = async (userId: number, userName: string) => {
        if (!currentOrganization) return;
        const confirmed = await requestConfirm({
            message: t("organization.confirmRemove", { name: userName }),
        });
        if (!confirmed) return;

        try {
            const response = await organizationService.removeMember(currentOrganization.id, userId);
            if (response?.status === 200) {
                notifyProvider.success(t("organization.memberRemoved"));
                loadMembers();
            } else {
                notifyProvider.error(t("organization.removeError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.removeError"));
        }
    };

    const handleCancelInvite = async (inviteId: number, email: string) => {
        if (!currentOrganization) return;
        const confirmed = await requestConfirm({
            message: t("organization.confirmCancelInvite", { email }),
        });
        if (!confirmed) return;

        try {
            const response = await organizationService.cancelInvite(currentOrganization.id, inviteId);
            if (response?.status === 200) {
                notifyProvider.success(t("organization.inviteCanceled"));
                loadMembers();
            } else {
                notifyProvider.error(t("organization.cancelInviteError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.cancelInviteError"));
        }
    };

    const handleResendInvite = async (inviteId: number) => {
        if (!currentOrganization) return;
        setResendingInviteId(inviteId);

        try {
            const response = await organizationService.resendInvite(currentOrganization.id, inviteId);
            if (response?.status === 200) {
                const message = response.data?.userExists
                    ? t("organization.inviteRefreshed")
                    : t("organization.inviteResent");
                notifyProvider.success(message);
                loadMembers();
            } else {
                notifyProvider.error(t("organization.resendInviteError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.resendInviteError"));
        } finally {
            setResendingInviteId(null);
        }
    };

    const startEditingRole = (member: OrganizationMember) => {
        setEditingMemberId(member.userId);
        setEditingRole(member.role);
    };

    const getRoleLabel = (role: string) => {
        return ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    if (!currentOrganization || !canManage) {
        return (
            <PainelContainer>
                <Card className="p-6">
                    <p className="text-ink/60">{t("organization.noOrganization")}</p>
                </Card>
            </PainelContainer>
        );
    }

    return (
        <PainelContainer>
            <div className="space-y-6">
                <TitleContainer title={t("organization.members")} />
                <div className="flex flex-wrap items-end justify-end gap-4">
                    {canManage && (
                        <Button
                            onClick={() => setShowInviteModal(true)}
                            leadingIcon={<FiUserPlus />}
                            disabled={!canInviteMore}
                        >
                            {t("organization.inviteMember")}
                        </Button>
                    )}
                </div>
            </div>

            {/* Active Members */}
            <Card className="mt-6 overflow-hidden">
                <div className="border-b border-ink/10 bg-ink/5 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-medium text-ink">
                                {t("organization.activeMembers")} ({members.length})
                            </h3>
                            {seatLimit !== null && (
                                <p className="text-xs text-ink/50">
                                    {t("billing.limitMetric", {
                                        metric: t("billing.metricSeats"),
                                        current: seatTotal,
                                        limit: seatLimit,
                                    })}
                                    {seatPending > 0 ? (
                                        <span className="ml-2">
                                            {t("billing.limitIncludesInvites", { pending: seatPending })}
                                        </span>
                                    ) : null}
                                </p>
                            )}
                        </div>
                        {!canInviteMore && (
                            <p className="text-xs font-medium text-rose-600">
                                {t("billing.limitDescription")}
                            </p>
                        )}
                    </div>
                </div>
                {isLoading ? (
                    <div className="p-6 text-center text-ink/60">
                        {t("common.loading")}
                    </div>
                ) : members.length === 0 ? (
                    <div className="p-6 text-center text-ink/60">
                        {t("organization.noMembers")}
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="border-b border-ink/10 bg-ink/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.memberName")}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.memberEmail")}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.memberRole")}
                                </th>
                                {canManage && (
                                    <th className="px-4 py-3 text-right text-sm font-medium text-ink/70">
                                        {t("common.actions")}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {members.map((member) => (
                                <tr key={member.userId} className="hover:bg-ink/5">
                                    <td className="px-4 py-3 text-sm text-ink">
                                        {member.user.name}
                                        {member.userId === currentUserId && (
                                            <span className="ml-2 text-xs text-ink/50">
                                                ({t("organization.you")})
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-ink/70">
                                        {member.user.email}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        {editingMemberId === member.userId ? (
                                            <div className="flex items-center gap-2">
                                                <Select
                                                    value={editingRole}
                                                    onChange={(e) => setEditingRole(e.target.value)}
                                                    className="w-32"
                                                >
                                                    {EDITABLE_ROLE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </Select>
                                                <Button
                                                    variant="accent"
                                                    size="sm"
                                                    iconOnly
                                                    className="h-9 w-9"
                                                    onClick={() => handleUpdateRole(member.userId)}
                                                    leadingIcon={<FiCheck />}
                                                    title={t("common.save")}
                                                    aria-label={t("common.save")}
                                                >
                                                    <span className="sr-only">{t("common.save")}</span>
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    iconOnly
                                                    className="h-9 w-9"
                                                    onClick={() => setEditingMemberId(null)}
                                                    leadingIcon={<FiX />}
                                                    title={t("common.cancel")}
                                                    aria-label={t("common.cancel")}
                                                >
                                                    <span className="sr-only">{t("common.cancel")}</span>
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center rounded-full bg-ink/10 px-2 py-1 text-xs capitalize">
                                                {getRoleLabel(member.role)}
                                            </span>
                                        )}
                                    </td>
                                    {canManage && (
                                        <td className="px-4 py-3 text-right">
                                            {member.userId !== currentUserId && (
                                                <div className="flex justify-end gap-2">
                                                    {isOwner && editingMemberId !== member.userId && member.role !== "owner" && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            iconOnly
                                                            className="h-9 w-9"
                                                            onClick={() => startEditingRole(member)}
                                                            leadingIcon={<FiEdit2 size={16} />}
                                                            title={t("organization.editRole")}
                                                            aria-label={t("organization.editRole")}
                                                        >
                                                            <span className="sr-only">{t("organization.editRole")}</span>
                                                        </Button>
                                                    )}
                                                    {member.role !== "owner" && (isOwner || member.role === "member") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            iconOnly
                                                            className="h-9 w-9 text-red-500 hover:text-red-700"
                                                            onClick={() => handleRemoveMember(member.userId, member.user.name)}
                                                            leadingIcon={<FiTrash2 size={16} />}
                                                            title={t("organization.removeMember")}
                                                            aria-label={t("organization.removeMember")}
                                                        >
                                                            <span className="sr-only">{t("organization.removeMember")}</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
                <Card className="mt-6 overflow-hidden">
                    <div className="border-b border-ink/10 bg-amber-50 px-4 py-3">
                        <h3 className="flex items-center gap-2 text-sm font-medium text-amber-800">
                            <FiClock className="text-amber-600" />
                            {t("organization.pendingInvites")} ({pendingInvites.length})
                        </h3>
                    </div>
                    <table className="w-full">
                        <thead className="border-b border-ink/10 bg-ink/5">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.memberEmail")}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.memberRole")}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.invitedAt")}
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-ink/70">
                                    {t("organization.expiresAt")}
                                </th>
                                {canManage && (
                                    <th className="px-4 py-3 text-right text-sm font-medium text-ink/70">
                                        {t("common.actions")}
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-ink/10">
                            {pendingInvites.map((invite) => (
                                <tr key={invite.id} className="hover:bg-ink/5">
                                    <td className="px-4 py-3 text-sm text-ink">
                                        <div className="flex items-center gap-2">
                                            <FiMail className="text-ink/40" />
                                            {invite.email}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800 capitalize">
                                            {getRoleLabel(invite.role)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-ink/70">
                                        {formatDate(invite.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-ink/70">
                                        {formatDate(invite.expiresAt)}
                                    </td>
                                    {canManage && (
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    iconOnly
                                                    className="h-9 w-9"
                                                    onClick={() => handleResendInvite(invite.id)}
                                                    leadingIcon={
                                                        <FiRefreshCw
                                                            size={16}
                                                            className={resendingInviteId === invite.id ? "animate-spin" : ""}
                                                        />
                                                    }
                                                    title={t("organization.resendInvite")}
                                                    aria-label={t("organization.resendInvite")}
                                                    disabled={resendingInviteId === invite.id}
                                                >
                                                    <span className="sr-only">{t("organization.resendInvite")}</span>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    iconOnly
                                                    className="h-9 w-9 text-red-500 hover:text-red-700"
                                                    onClick={() => handleCancelInvite(invite.id, invite.email)}
                                                    leadingIcon={<FiTrash2 size={16} />}
                                                    title={t("organization.cancelInvite")}
                                                    aria-label={t("organization.cancelInvite")}
                                                >
                                                    <span className="sr-only">{t("organization.cancelInvite")}</span>
                                                </Button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)}>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-ink/40">
                            {t("organization.invite")}
                        </p>
                        <h2 className="font-display text-xl text-ink">
                            {t("organization.inviteMember")}
                        </h2>
                    </div>
                    <form onSubmit={handleInvite} className="space-y-4">
                        <Field label={t("organization.inviteEmail")}>
                            <Input
                                required
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="email@exemplo.com"
                            />
                        </Field>
                        <Field label={t("organization.inviteRole")}>
                            <Select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                            >
                                <option value="member">{t("organization.roleMember")}</option>
                                <option value="admin">{t("organization.roleAdmin")}</option>
                            </Select>
                        </Field>
                        <p className="text-xs text-ink/50">
                            {t("organization.inviteHint")}
                        </p>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowInviteModal(false)}
                            >
                                {t("common.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isInviting}
                                leadingIcon={<FiUserPlus />}
                            >
                                {t("organization.sendInvite")}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </PainelContainer>
    );
};

export default OrganizationMembers;
