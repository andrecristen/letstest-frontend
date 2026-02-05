import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PainelContainer from "../../components/PainelContainer";
import { Button, Card } from "../../ui";

const BillingSuccess: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <PainelContainer>
      <Card className="space-y-4 p-6 text-center">
        <h2 className="font-display text-2xl text-ink">{t("billing.successTitle")}</h2>
        <p className="text-sm text-ink/60">{t("billing.successSubtitle")}</p>
        <div className="flex justify-center">
          <Button onClick={() => navigate("/billing")}>{t("billing.backToBilling")}</Button>
        </div>
      </Card>
    </PainelContainer>
  );
};

export default BillingSuccess;
