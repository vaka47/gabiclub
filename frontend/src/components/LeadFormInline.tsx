"use client";

import Image from "next/image";
import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";

import { resolveMediaUrl, submitLead } from "@/lib/api";
import type { LeadFormData, LeadFormInitial } from "@/lib/types";

type LeadFormInlineProps = {
  photo?: string;
  initial?: LeadFormInitial;
};

type FormState = LeadFormData & { status: "idle" | "loading" | "success" | "error"; error?: string };


const initialFormState: FormState = {
  full_name: "",
  phone: "",
  preferred_direction: "",
  message: "",
  source: "hero-inline",
  status: "idle",
};

export default function LeadFormInline({ photo, initial }: LeadFormInlineProps) {
  const [formState, setFormState] = useState<FormState>({ ...initialFormState, ...initial });

  const bgSrc = useMemo(() => resolveMediaUrl(photo ?? process.env.NEXT_PUBLIC_CLUB_PHOTO) ?? undefined, [photo]);

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
        source: formState.source ?? "hero-inline",
      };
      const responseMessage = await submitLead(payload);
      setFormState((prev) => ({ ...prev, status: "success", message: responseMessage }));
    } catch (e) {
      setFormState((prev) => ({
        ...prev,
        status: "error",
        error: "Не удалось отправить заявку. Попробуйте ещё раз.",
      }));
    }
  };

  const disabled = formState.status === "loading";

  return (
    <div className="gradient-card">
      {/* Underlay photo */}
      {bgSrc && (
        <Image
          src={bgSrc}
          alt="Gabi Club"
          fill
          className="-z-10 object-cover"
          sizes="(min-width: 768px) 560px, 100vw"
          priority
        />
      )}

      {/* Content card */}
      <div className="relative p-6 md:p-8">
        <div className="mb-5 flex flex-col gap-1">
          <span className="badge bg-white/30 text-white">Запишитесь в клуб</span>
          <h3 className="text-2xl font-semibold text-white">Заявка на тренировку</h3>
          <p className="text-sm text-white/85">Ответим в течение рабочего дня</p>
        </div>

        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium text-white/90">
            Имя и фамилия
            <input
              value={formState.full_name}
              onChange={handleChange("full_name")}
              required
              className="rounded-xl border border-white/50 bg-white/90 px-4 py-3 text-base text-gabi-dark shadow-sm placeholder:text-slate-400 focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
              placeholder="Как вас зовут"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-white/90">
            Телефон
            <input
              value={formState.phone}
              onChange={handleChange("phone")}
              required
              className="rounded-xl border border-white/50 bg-white/90 px-4 py-3 text-base text-gabi-dark shadow-sm placeholder:text-slate-400 focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
              placeholder="+7 (___) ___-__-__"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-white/90 md:col-span-2">
            Направление / цель
            <input
              value={formState.preferred_direction}
              onChange={handleChange("preferred_direction")}
              className="rounded-xl border border-white/50 bg-white/90 px-4 py-3 text-base text-gabi-dark shadow-sm placeholder:text-slate-400 focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
              placeholder="Например: Подготовка к трейлу"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-white/90 md:col-span-2">
            Комментарий
            <textarea
              value={formState.message}
              onChange={handleChange("message")}
              rows={3}
              className="rounded-xl border border-white/50 bg-white/90 px-4 py-3 text-base text-gabi-dark shadow-sm placeholder:text-slate-400 focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
              placeholder="Опишите запрос или выберите программу"
            />
          </label>

          {formState.status === "error" && (
            <div className="md:col-span-2 rounded-xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm text-red-700">
              {formState.error}
            </div>
          )}

          {formState.status !== "success" ? (
            <button
              type="submit"
              disabled={disabled}
              className="btn-primary md:col-span-2 justify-center"
            >
              {formState.status === "loading" ? "Отправляем..." : "Отправить заявку"}
            </button>
          ) : (
            <p className="md:col-span-2 text-center text-sm font-medium text-white">
              {formState.message || "Заявка отправлена! Мы свяжемся с вами совсем скоро."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
