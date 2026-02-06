import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { Button, Card, Field, Input, Textarea } from "../../ui";
import notifyProvider from "../../infra/notifyProvider";
import { createProject } from "../../services/projectService";
import { ProjectVisibilityEnum } from "../../models/ProjectData";

const OnboardingFirstProject: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const response = await createProject({
                name,
                description,
                visibility: ProjectVisibilityEnum.Private,
                situation: 1,
            });
            if (response?.status === 201) {
                notifyProvider.success(t("onboarding.projectSuccess"));
                navigate("/dashboard");
            } else {
                notifyProvider.error(t("onboarding.projectError"));
            }
        } catch (error: any) {
            notifyProvider.error(error?.response?.data?.error || t("onboarding.projectError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen px-6 py-10">
            <div className="mx-auto w-full max-w-3xl space-y-6">
                <div className="flex items-center gap-3 text-ink/60">
                    <span className="rounded-full border border-ink/10 bg-paper px-3 py-1 text-xs">
                        {t("onboarding.stepLabel", { step: 3, total: 3 })}
                    </span>
                    <span className="text-sm">{t("onboarding.projectStep")}</span>
                </div>
                <div className="space-y-2">
                    <h1 className="font-display text-3xl text-ink">{t("onboarding.projectTitle")}</h1>
                    <p className="text-ink/70">{t("onboarding.projectSubtitle")}</p>
                </div>

                <Card className="p-6">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <Field label={t("common.nameLabel")}>
                            <Input
                                type="text"
                                required
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                            />
                        </Field>
                        <Field label={t("common.descriptionLabel")}>
                            <Textarea
                                required
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                rows={4}
                            />
                        </Field>
                        <div className="flex flex-wrap gap-3">
                            <Button type="submit" isLoading={isLoading} leadingIcon={<FiArrowRight />}>
                                {t("onboarding.finishSetup")}
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>
                                {t("onboarding.skipToDashboard")}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </section>
    );
};

export default OnboardingFirstProject;
