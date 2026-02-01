import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import { auth } from "../../infra/http-request/authProvider";
import notifyProvider from "../../infra/notifyProvider";
import tokenProvider from "../../infra/tokenProvider";
import { AuthData } from "../../models/AuthData";
import logo from "../../assets/logo-transparente.png";
import { Button, Card, Field, Input } from "../../ui";

const UserFormLogin = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validatingLogin, setValidatingLogin] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    try {
      event.preventDefault();
      setValidatingLogin(true);
      const data: AuthData = { email, password };
      const response = await auth(data);
      if (response?.status === 200) {
        tokenProvider.setSession(response.data.token, response.data.userId);
        notifyProvider.success(t("auth.loginSuccess"));
        navigate("/dashboard");
        return;
      }
      if (response?.data.error) {
        notifyProvider.error(response.data.error);
      } else {
        notifyProvider.error(t("auth.loginError"));
      }
      setEmail("");
      setPassword("");
      setValidatingLogin(false);
    } catch (error) {
      notifyProvider.error(t("auth.loginError"));
    }
  };

  return (
    <section className="min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="flex flex-col gap-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-fit"
          >
            <img src={logo} alt="Logo login" className="h-16" />
          </button>
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">
              {t("auth.loginTitle")}
            </h1>
            <p className="text-base text-ink/70">
              {t("auth.loginSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ink/60">
            <span className="rounded-full border border-ink/10 bg-paper px-3 py-1">
              {t("auth.loginTag1")}
            </span>
            <span className="rounded-full border border-ink/10 bg-paper px-3 py-1">
              {t("auth.loginTag2")}
            </span>
            <span className="rounded-full border border-ink/10 bg-paper px-3 py-1">
              {t("auth.loginTag3")}
            </span>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label={t("auth.emailPlaceholder")}>
              <Input
                required
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label={t("auth.passwordPlaceholder")}
            >
              <Input
                required
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button
              type="submit"
              isLoading={validatingLogin}
              className="w-full"
              leadingIcon={<FiArrowRight />}
            >
              {t("auth.loginButton")}
            </Button>
          </form>
          <div className="text-sm text-ink/60">
            {t("auth.noAccount")} {" "}
            <a
              className="font-semibold text-ocean hover:text-ink"
              href="/register"
            >
              {t("auth.createAccount")}
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default UserFormLogin;
