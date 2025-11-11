"use client";

import { useLeadModal } from "./providers/LeadModalProvider";
import type { LeadFormInitial } from "@/lib/types";
import type { CSSProperties } from "react";

type LeadCtaButtonProps = {
  label: string;
  source?: string;
  className?: string;
  initial?: LeadFormInitial;
  style?: CSSProperties;
};

export default function LeadCtaButton({ label, source = "cta", className, initial, style }: LeadCtaButtonProps) {
  const { openLeadModal } = useLeadModal();

  return (
    <button
      className={className}
      style={style}
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
