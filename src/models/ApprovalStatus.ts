import i18n from "../i18n";

export enum ApprovalStatusEnum {
  Draft = 1,
  Reviewed = 2,
  Approved = 3,
}

const approvalStatusLabels: Record<ApprovalStatusEnum, string> = {
  [ApprovalStatusEnum.Draft]: "approval.draft",
  [ApprovalStatusEnum.Reviewed]: "approval.reviewed",
  [ApprovalStatusEnum.Approved]: "approval.approved",
};

export const getApprovalStatusLabel = (value?: number | null) => {
  if (!value) return i18n.t(approvalStatusLabels[ApprovalStatusEnum.Draft]);
  const labelKey = approvalStatusLabels[value as ApprovalStatusEnum];
  return labelKey ? i18n.t(labelKey) : i18n.t(approvalStatusLabels[ApprovalStatusEnum.Draft]);
};

export const getApprovalStatusVariant = (value?: number | null) => {
  switch (value) {
    case ApprovalStatusEnum.Reviewed:
      return "accent";
    case ApprovalStatusEnum.Approved:
      return "success";
    default:
      return "neutral";
  }
};
