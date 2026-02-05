import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiCheck, FiMail, FiClock } from "react-icons/fi";
import * as organizationService from "../../services/organizationService";
import type { MyInvite } from "../../services/organizationService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";
import { useOrganization } from "../../contexts/OrganizationContext";

const ROLE_OPTIONS: Record<string, string> = {
    member: "Membro",
    admin: "Administrador",
    owner: "Proprietario",
};

const MyInvites: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { refreshOrganizations } = useOrganization();
    const [searchParams] = useSearchParams();

    const [invites, setInvites] = useState<MyInvite[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [acceptingInviteId, setAcceptingInviteId] = useState<number | null>(null);

    const loadInvites = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await organizationService.getMyInvites();
            if (response?.data && Array.isArray(response.data)) {
                setInvites(response.data);
            } else {
                setInvites([]);
            }
        } catch (error) {
            setInvites([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleAcceptInviteByToken = useCallback(async (token: string) => {
        try {
            const response = await organizationService.acceptInvite(token);
            if (response?.status === 200) {
                notifyProvider.success(t("organization.inviteAccepted"));
                await refreshOrganizations();
                navigate("/dashboard");
            } else {
                notifyProvider.error(response?.data?.error || t("organization.acceptInviteError"));
                navigate("/my-invites");
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.acceptInviteError"));
            navigate("/my-invites");
        }
    }, [navigate, refreshOrganizations, t]);

    // Handle token from URL (email invite link)
    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            handleAcceptInviteByToken(token);
        }
    }, [handleAcceptInviteByToken, searchParams]);

    useEffect(() => {
        loadInvites();
    }, [loadInvites]);

    const handleAcceptInvite = async (invite: MyInvite) => {
        setAcceptingInviteId(invite.id);
        try {
            const response = await organizationService.acceptInvite(invite.token);
            if (response?.status === 200) {
                notifyProvider.success(t("organization.inviteAccepted"));
                await refreshOrganizations();
                loadInvites();
            } else {
                notifyProvider.error(response?.data?.error || t("organization.acceptInviteError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.acceptInviteError"));
        } finally {
            setAcceptingInviteId(null);
        }
    };

    const getRoleLabel = (role: string) => {
        return ROLE_OPTIONS[role] || role;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
    };

    const isExpired = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    return (
        <PainelContainer>
            <div className="space-y-6">
                <TitleContainer title={t("organization.myInvites")} />
            </div>

            <Card className="mt-6 overflow-hidden">
                {isLoading ? (
                    <div className="p-6 text-center text-ink/60">
                        {t("common.loading")}
                    </div>
                ) : invites.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiMail className="mx-auto mb-4 text-4xl text-ink/30" />
                        <p className="text-ink/60">{t("organization.noInvites")}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-ink/10">
                        {invites.map((invite) => (
                            <div
                                key={invite.id}
                                className={`p-6 ${isExpired(invite.expiresAt) ? "opacity-50" : ""}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/10 text-ink/60">
                                                {invite.organization.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-ink">
                                                    {invite.organization.name}
                                                </h3>
                                                <p className="text-sm text-ink/60">
                                                    {t("organization.inviteFrom")} {invite.organization.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex flex-wrap gap-4 text-sm">
                                            <div className="flex items-center gap-1 text-ink/60">
                                                <span className="font-medium">{t("organization.memberRole")}:</span>
                                                <span className="inline-flex items-center rounded-full bg-ink/10 px-2 py-0.5 text-xs capitalize">
                                                    {getRoleLabel(invite.role)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-ink/60">
                                                <FiClock className="text-ink/40" />
                                                <span>
                                                    {isExpired(invite.expiresAt)
                                                        ? `Expirado em ${formatDate(invite.expiresAt)}`
                                                        : `Expira em ${formatDate(invite.expiresAt)}`
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {!isExpired(invite.expiresAt) && (
                                            <Button
                                                onClick={() => handleAcceptInvite(invite)}
                                                isLoading={acceptingInviteId === invite.id}
                                                leadingIcon={<FiCheck />}
                                            >
                                                {t("organization.acceptInvite")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </PainelContainer>
    );
};

export default MyInvites;
