"use client";

import { createContext, useContext, useMemo, useState } from "react";

import type { LeadFormInitial } from "@/lib/types";
import LeadFormModal from "../LeadFormModal";

type LeadModalContextValue = {
  openLeadModal: (initial?: LeadFormInitial) => void;
  closeLeadModal: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | undefined>(undefined);

export function useLeadModal(): LeadModalContextValue {
  const context = useContext(LeadModalContext);
  if (!context) {
    throw new Error("useLeadModal должен использоваться внутри LeadModalProvider");
  }
  return context;
}

export default function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialData, setInitialData] = useState<LeadFormInitial>({});

  const value = useMemo<LeadModalContextValue>(
    () => ({
      openLeadModal: (payload?: LeadFormInitial) => {
        setInitialData(payload ?? {});
        setIsOpen(true);
      },
      closeLeadModal: () => setIsOpen(false),
    }),
    [],
  );

  return (
    <LeadModalContext.Provider value={value}>
      {children}
      <LeadFormModal open={isOpen} onClose={value.closeLeadModal} initialData={initialData} />
    </LeadModalContext.Provider>
  );
}
