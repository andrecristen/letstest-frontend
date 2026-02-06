import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { resetPassword } from "../../infra/http-request/authProvider";
import notifyProvider from "../../infra/notifyProvider";
import { Button, Card, Field, Input } from "../../ui";
import logo from "../../assets/logo-transparente.png";

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!token) {
            notifyProvider.error(t("auth.resetTokenMissing"));
            return;
        }
        if (password !== confirmPassword) {
            notifyProvider.info(t("auth.passwordMismatch"));
            return;
        }
        setIsLoading(true);
        try {
            const response = await resetPassword(token, password);
            if (response?.status === 200) {
                notifyProvider.success(t("auth.resetSuccess"));
                navigate("/login");
            } else {
                notifyProvider.error(t("auth.resetError"));
            }
        } catch {
            notifyProvider.error(t("auth.resetError"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="min-h-screen px-6 py-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="flex flex-col gap-6">
                    <button type="button" onClick={() => navigate("/")} className="w-fit">
                        <img src={logo} alt="logo" className="h-16" />
                    </button>
                    <div className="space-y-3">
                        <h1 className="font-display text-3xl text-ink sm:text-4xl">
                            {t("auth.resetTitle")}
                        </h1>
                        <p className="text-base text-ink/70">
                            {t("auth.resetSubtitle")}
                        </p>
                    </div>
                </div>

                <Card className="flex flex-col gap-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Field label={t("auth.passwordPlaceholder")}>
                            <Input
                                required
                                type="password"
                                placeholder={t("auth.passwordPlaceholder")}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Field>
                        <Field label={t("auth.confirmPassword")}>
                            <Input
                                required
                                type="password"
                                placeholder={t("auth.confirmPassword")}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Field>
                        <Button type="submit" isLoading={isLoading} className="w-full" leadingIcon={<FiArrowRight />}>
                            {t("auth.resetButton")}
                        </Button>
                    </form>
                    <div className="text-sm text-ink/60">
                        <a className="font-semibold text-ocean hover:text-ink" href="/login">
                            {t("auth.backToLogin")}
                        </a>
                    </div>
                </Card>
            </div>
        </section>
    );
};

export default ResetPassword;
