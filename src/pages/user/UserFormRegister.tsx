import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowRight } from "react-icons/fi";
import logo from "../../assets/logo-transparente.png";
import { registerAccount } from "../../infra/http-request/authProvider";
import notifyProvider from "../../infra/notifyProvider";
import { RegisterData } from "../../models/RegisterData";
import { Button, Card, Field, Input } from "../../ui";

const UserFormRegister = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { register, handleSubmit, setValue } = useForm<RegisterData>();
  const [validatingRegister, setValidatingRegister] = useState(false);

  const onSubmit: SubmitHandler<RegisterData> = async (data) => {
    setValidatingRegister(true);
    if (data.password !== data.confirmPassword) {
      notifyProvider.info(t("auth.passwordMismatch"));
      setValue("password", undefined);
      setValue("confirmPassword", undefined);
      setValidatingRegister(false);
      return;
    }
    const response = await registerAccount(data);
    if (response?.status === 200) {
      notifyProvider.success(t("auth.registerSuccess"));
      navigate("/login");
    } else {
      notifyProvider.error(t("auth.registerError"));
    }
    setValidatingRegister(false);
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
            <img src={logo} alt="logo" className="h-16" />
          </button>
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-ink sm:text-4xl">
              {t("auth.registerTitle")}
            </h1>
            <p className="text-base text-ink/70">
              {t("auth.registerSubtitle")}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-ink/60">
            <span className="rounded-full border border-ink/10 bg-paper px-3 py-1">
              {t("auth.registerTag1")}
            </span>
            <span className="rounded-full border border-ink/10 bg-paper px-3 py-1">
              {t("auth.registerTag2")}
            </span>
            <span className="rounded-full border border-ink/10 bg-paper px-3 py-1">
              {t("auth.registerTag3")}
            </span>
          </div>
        </div>

        <Card className="flex flex-col gap-6">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Field label={t("auth.namePlaceholder")}>
              <Input
                {...register("name")}
                type="text"
                placeholder={t("auth.namePlaceholder")}
                required
              />
            </Field>
            <Field label={t("auth.emailPlaceholder")}>
              <Input
                {...register("email")}
                type="email"
                placeholder={t("auth.emailPlaceholder")}
                required
              />
            </Field>
            <Field label={t("auth.passwordPlaceholder")}>
              <Input
                {...register("password")}
                type="password"
                placeholder={t("auth.passwordPlaceholder")}
                required
              />
            </Field>
            <Field label={t("auth.confirmPassword")}>
              <Input
                {...register("confirmPassword")}
                type="password"
                placeholder={t("auth.confirmPassword")}
                required
              />
            </Field>
            <Button
              type="submit"
              isLoading={validatingRegister}
              className="w-full"
              leadingIcon={<FiArrowRight />}
            >
              {t("auth.registerButton")}
            </Button>
            <p className="text-sm text-ink/60">
              {t("auth.alreadyHaveAccount")} {" "}
              <a
                href="/login"
                className="font-semibold text-ember hover:text-ink"
              >
                {t("auth.signInHere")}
              </a>
            </p>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default UserFormRegister;
