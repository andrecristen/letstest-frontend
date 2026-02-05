import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiSave } from "react-icons/fi";
import { useOrganization } from "../../contexts/OrganizationContext";
import { useConfig } from "../../contexts/ConfigContext";
import * as organizationService from "../../services/organizationService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input } from "../../ui";
import PainelContainer from "../../components/PainelContainer";
import TitleContainer from "../../components/TitleContainer";

const OrganizationSettings: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentOrganization, canManage, refreshOrganizations, isOwner } = useOrganization();
    const { billingEnabled } = useConfig();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentOrganization) {
            setName(currentOrganization.name);
            setSlug(currentOrganization.slug);
        }
    }, [currentOrganization]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!currentOrganization || !canManage) return;

        setIsLoading(true);
        try {
            const response = await organizationService.update(currentOrganization.id, { name });
            if (response?.status === 200) {
                notifyProvider.success(t("organization.updateSuccess"));
                await refreshOrganizations();
            } else {
                notifyProvider.error(t("organization.updateError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("organization.updateError"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentOrganization && !canManage) {
            notifyProvider.error(t("organization.accessDenied"));
            navigate("/dashboard");
        }
    }, [currentOrganization, canManage, navigate, t]);

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
            <TitleContainer title={t("organization.settings")} />

            <Card className="mt-6 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Field label={t("organization.name")}>
                        <Input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={!canManage}
                        />
                    </Field>

                    <Field label={t("organization.slug")}>
                        <Input
                            type="text"
                            value={slug}
                            disabled
                            className="bg-ink/5"
                        />
                        <p className="mt-1 text-xs text-ink/50">
                            {t("organization.slugReadonly")}
                        </p>
                    </Field>

                    {billingEnabled && (
                        <Field label={t("organization.plan")}>
                            <Input
                                type="text"
                                value={currentOrganization.plan}
                                disabled
                                className="bg-ink/5 capitalize"
                            />
                        </Field>
                    )}

                    {canManage && (
                        <Button
                            type="submit"
                            isLoading={isLoading}
                            leadingIcon={<FiSave />}
                        >
                            {t("common.save")}
                        </Button>
                    )}
                </form>
            </Card>

            {billingEnabled && isOwner && (
                <Card className="mt-6 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-ink">
                                {t("billing.title")}
                            </p>
                            <p className="text-sm text-ink/60">
                                {t("billing.settingsHelp")}
                            </p>
                        </div>
                        <Button onClick={() => navigate("/billing")}>
                            {t("billing.manageBilling")}
                        </Button>
                    </div>
                </Card>
            )}
        </PainelContainer>
    );
};

export default OrganizationSettings;
