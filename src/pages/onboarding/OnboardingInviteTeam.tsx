import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiPlus, FiTrash2 } from "react-icons/fi";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as organizationService from "../../services/organizationService";
import * as billingService from "../../services/billingService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input } from "../../ui";

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

const OnboardingInviteTeam: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentOrganization } = useOrganization();

    const [email, setEmail] = useState("");
    const [invites, setInvites] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [seatLimit, setSeatLimit] = useState<number | null>(null);
    const [memberCount, setMemberCount] = useState(0);
    const [pendingInvitesCount, setPendingInvitesCount] = useState(0);

    useEffect(() => {
        const loadLimits = async () => {
            if (!currentOrganization) return;
            try {
                const [usageResponse, membersResponse] = await Promise.all([
                    billingService.getUsage(),
                    organizationService.getMembers(currentOrganization.id),
                ]);
                if (usageResponse?.status === 200) {
                    const limits = usageResponse.data?.limits;
                    if (limits && Object.prototype.hasOwnProperty.call(limits, "seats")) {
                        setSeatLimit(limits.seats === null ? null : Number(limits.seats));
                    }
                    const seats = Number(usageResponse.data?.usage?.seats ?? 0);
                    setMemberCount(Number.isFinite(seats) ? seats : 0);
                }
                if (membersResponse?.status === 200) {
                    const pending = membersResponse.data?.pendingInvites ?? [];
                    setPendingInvitesCount(Array.isArray(pending) ? pending.length : 0);
                }
            } catch {
                // Silent fallback: limits will be enforced by the backend
            }
        };
        loadLimits();
    }, [currentOrganization]);

    const handleAddInvite = () => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;
        if (!isValidEmail(trimmed)) {
            notifyProvider.info(t("onboarding.invalidEmail"));
            return;
        }
        if (invites.includes(trimmed)) {
            notifyProvider.info(t("onboarding.emailAlreadyAdded"));
            return;
        }
        if (seatLimit !== null) {
            const current = memberCount + pendingInvitesCount + invites.length;
            if (current + 1 > seatLimit) {
                notifyProvider.error(t("billing.limitDescription"));
                return;
            }
        }
        setInvites((prev) => [...prev, trimmed]);
        setEmail("");
    };

    const handleRemoveInvite = (target: string) => {
        setInvites((prev) => prev.filter((item) => item !== target));
    };

    const handleSubmit = async () => {
        if (!currentOrganization) return;
        if (invites.length === 0) {
            navigate("/onboarding/first-project");
            return;
        }
        setIsLoading(true);
        try {
            let hadErrors = false;
            let limitReached = false;
            for (const invite of invites) {
                const response = await organizationService.inviteMember(currentOrganization.id, {
                    email: invite,
                    role: "member",
                });
                if (response?.status === 201) continue;
                if (response?.status === 402) {
                    notifyProvider.error(t("billing.limitDescription"));
                    limitReached = true;
                    hadErrors = true;
                    break;
                }
                hadErrors = true;
            }
            if (limitReached) {
                return;
            }
            if (hadErrors) {
                notifyProvider.error(t("onboarding.inviteError"));
            } else {
                notifyProvider.success(t("onboarding.inviteSuccess"));
            }
            navigate("/onboarding/first-project");
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("onboarding.inviteError"));
        } finally {
            setIsLoading(false);
        }
    };

    if (!currentOrganization) {
        return (
            <section className="min-h-screen px-6 py-10">
                <div className="mx-auto w-full max-w-2xl">
                    <Card className="p-6">
                        <p className="text-ink/60">{t("organization.noOrganization")}</p>
                    </Card>
                </div>
            </section>
        );
    }

    return (
        <section className="min-h-screen px-6 py-10">
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <div className="flex items-center gap-3 text-ink/60">
                    <span className="rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs">
                        {t("onboarding.stepLabel", { step: 2, total: 3 })}
                    </span>
                    <span className="text-sm">{t("onboarding.teamStep")}</span>
                </div>
                <div className="space-y-2">
                    <h1 className="font-display text-3xl text-ink">{t("onboarding.inviteTitle")}</h1>
                    <p className="text-ink/70">{t("onboarding.inviteSubtitle")}</p>
                </div>

                <Card className="p-6 space-y-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <Field label={t("onboarding.inviteEmailLabel")} className="flex-1">
                            <Input
                                type="email"
                                value={email}
                                placeholder={t("onboarding.inviteEmailPlaceholder")}
                                onChange={(event) => setEmail(event.target.value)}
                            />
                        </Field>
                        <Button type="button" onClick={handleAddInvite} leadingIcon={<FiPlus />}>
                            {t("onboarding.addInvite")}
                        </Button>
                    </div>

                    {invites.length > 0 && (
                        <div className="space-y-2">
                            {invites.map((invite) => (
                                <div
                                    key={invite}
                                    className="flex items-center justify-between rounded-lg border border-ink/10 bg-paper px-3 py-2 text-sm text-ink/70"
                                >
                                    <span>{invite}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveInvite(invite)}
                                        className="text-ink/40 hover:text-ink"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <div className="flex flex-wrap gap-3">
                    <Button
                        type="button"
                        isLoading={isLoading}
                        leadingIcon={<FiArrowRight />}
                        onClick={handleSubmit}
                    >
                        {t("common.continue")}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate("/onboarding/first-project")}
                    >
                        {t("onboarding.skipStep")}
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default OnboardingInviteTeam;
