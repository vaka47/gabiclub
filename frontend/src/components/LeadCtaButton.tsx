"use client";

import { useLeadModal } from "./providers/LeadModalProvider";

type LeadCtaButtonProps = {
  label: string;
  source?: string;
  className?: string;
};

export default function LeadCtaButton({ label, source = "cta", className }: LeadCtaButtonProps) {
  const { openLeadModal } = useLeadModal();

  return (
    <button
      className={className}
      type="button"
      onClick={() =>
        openLeadModal({
          source,
          message: "Хочу начать тренироваться в Gabi Club",
        })
      }
    >
      {label}
    </button>
  );
}
