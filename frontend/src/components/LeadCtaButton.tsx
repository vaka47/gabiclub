"use client";

import { useLeadModal } from "./providers/LeadModalProvider";
import type { LeadFormInitial } from "@/lib/types";

type LeadCtaButtonProps = {
  label: string;
  source?: string;
  className?: string;
  initial?: LeadFormInitial;
};

export default function LeadCtaButton({ label, source = "cta", className, initial }: LeadCtaButtonProps) {
  const { openLeadModal } = useLeadModal();

  return (
    <button
      className={className}
      type="button"
      onClick={() =>
        openLeadModal({
          source,
          message: "Хочу начать тренироваться в Gabi Club",
          ...initial,
        })
      }
    >
      {label}
    </button>
  );
}
