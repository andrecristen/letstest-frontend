import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiHome } from "react-icons/fi";
import { useOrganization } from "../../contexts/OrganizationContext";
import * as organizationService from "../../services/organizationService";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input } from "../../ui";

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

const OnboardingOrgSetup: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { currentOrganization, refreshOrganizations } = useOrganization();

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [slugEdited, setSlugEdited] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentOrganization) {
            setName(currentOrganization.name);
            setSlug(currentOrganization.slug);
        }
    }, [currentOrganization]);

    const handleNameChange = (value: string) => {
        setName(value);
        if (!slugEdited) {
            setSlug(slugify(value));
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!currentOrganization) return;

        setIsLoading(true);
        try {
            const response = await organizationService.update(currentOrganization.id, {
                name,
                slug,
            });
            if (response?.status === 200) {
                await refreshOrganizations();
                notifyProvider.success(t("onboarding.orgSetupSuccess"));
                navigate("/onboarding/invite-team");
            } else {
                notifyProvider.error(t("onboarding.orgSetupError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("onboarding.orgSetupError"));
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
                        {t("onboarding.stepLabel", { step: 1, total: 3 })}
                    </span>
                    <span className="text-sm">{t("onboarding.welcome")}</span>
                </div>
                <div className="space-y-2">
                    <h1 className="font-display text-3xl text-ink">{t("onboarding.orgSetupTitle")}</h1>
                    <p className="text-ink/70">{t("onboarding.orgSetupSubtitle")}</p>
                </div>

                <Card className="p-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Field label={t("organization.name")}>
                            <Input
                                type="text"
                                required
                                value={name}
                                onChange={(event) => handleNameChange(event.target.value)}
                            />
                        </Field>
                        <Field label={t("organization.slug")}>
                            <Input
                                type="text"
                                required
                                value={slug}
                                onChange={(event) => {
                                    setSlugEdited(true);
                                    setSlug(event.target.value);
                                }}
                            />
                        </Field>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                leadingIcon={<FiArrowRight />}
                            >
                                {t("common.continue")}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                leadingIcon={<FiHome />}
                                onClick={() => navigate("/dashboard")}
                            >
                                {t("onboarding.skipToDashboard")}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </section>
    );
};

export default OnboardingOrgSetup;
