"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { submitLead } from "@/lib/api";
import type { LeadFormData, LeadFormInitial } from "@/lib/types";

type LeadFormModalProps = {
  open: boolean;
  onClose: () => void;
  initialData?: LeadFormInitial;
};

type FormState = LeadFormData & { status: "idle" | "loading" | "success" | "error"; error?: string };

const initialFormState: FormState = {
  full_name: "",
  phone: "",
  preferred_direction: "",
  message: "",
  source: "web",
  status: "idle",
};

const formBackdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.97 },
};

export default function LeadFormModal({ open, onClose, initialData }: LeadFormModalProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);

  useEffect(() => {
    if (open) {
      setFormState({
        ...initialFormState,
        ...initialData,
        status: "idle",
      });
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  const handleChange = (field: keyof LeadFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormState((prev) => ({ ...prev, status: "loading", error: undefined }));

    try {
      const payload: LeadFormData = {
        full_name: formState.full_name,
        phone: formState.phone,
        preferred_direction: formState.preferred_direction,
        message: formState.message,
        source: formState.source,
      };

      const responseMessage = await submitLead(payload);
      setFormState((prev) => ({
        ...prev,
        status: "success",
        message: prev.message || responseMessage,
        error: undefined,
      }));
      setTimeout(() => {
        onClose();
        setFormState(initialFormState);
      }, 1400);
    } catch {
      setFormState((prev) => ({
        ...prev,
        status: "error",
        error: "Не удалось отправить заявку. Попробуйте ещё раз.",
      }));
    }
  };

  const disabled = formState.status === "loading";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={formBackdropVariants}
          onClick={onClose}
        >
          <motion.div
            className="relative mx-4 w-full max-w-xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="gradient-border">
              <div className="gradient-inner card-surface">
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 text-gray-400 transition hover:text-gabi-blue"
                  aria-label="Закрыть форму"
                  type="button"
                >
                  ✕
                </button>

                <div className="mb-6 flex flex-col gap-2 pr-8">
                  <span className="badge w-fit">Запишитесь в клуб</span>
                  <h3 className="text-2xl font-semibold text-gabi-dark">Заявка на тренировку</h3>
                  <p className="text-sm text-gray-500">
                    Оставьте контакты — тренер ответит в течение рабочего дня.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                      Имя и фамилия
                      <input
                        value={formState.full_name}
                        onChange={handleChange("full_name")}
                        required
                        className="rounded-xl border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
                        placeholder="Как вас зовут"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                      Телефон
                      <input
                        value={formState.phone}
                        onChange={handleChange("phone")}
                        required
                        className="rounded-xl border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
                        placeholder="+7 (___) ___-__-__"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                    Направление / цель
                    <input
                      value={formState.preferred_direction}
                      onChange={handleChange("preferred_direction")}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
                    placeholder="Например: Подготовка к трейлу"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                    Комментарий
                    <textarea
                      value={formState.message}
                      onChange={handleChange("message")}
                      rows={4}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
                      placeholder="Опишите запрос или выберите программу"
                    />
                  </label>

                  {formState.status === "error" && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {formState.error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={disabled}
                    className="btn-primary w-full justify-center"
                  >
                    {formState.status === "loading" ? "Отправляем..." : "Отправить заявку"}
                  </button>

                  {formState.status === "success" && (
                    <p className="text-center text-sm text-emerald-600">
                      {formState.message || "Заявка отправлена! Мы свяжемся с вами совсем скоро."}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
