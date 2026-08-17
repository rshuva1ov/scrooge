export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL?.trim() ?? "";

export const SUPPORT_MAILTO = SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : "";

export const DONATE_URL = import.meta.env.VITE_DONATE_URL?.trim() ?? "";

export const buildSupportMailto = (question: string): string => {
  if (!SUPPORT_EMAIL) {
    return "";
  }

  const subject = encodeURIComponent("Вопрос по Scrooge Vault");
  const body = encodeURIComponent(question.trim());
  return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
};
