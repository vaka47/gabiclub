"use client";

import { addDays, format, isAfter, isBefore, parseISO, startOfWeek } from "date-fns";
import { ru } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import type {
  Coach,
  LevelTag,
  Location,
  TrainingDirection,
  TrainingSession,
} from "@/lib/types";
import { useLeadModal } from "./providers/LeadModalProvider";
import { getTrainingSessions } from "@/lib/api";

type ScheduleExplorerProps = {
  sessions: TrainingSession[];
  directions: TrainingDirection[];
  coaches: Coach[];
  locations: Location[];
  levels: LevelTag[];
};

type Filters = {
  type: string;
  direction: string;
  coach: string;
  location: string;
  level: string;
};

const typeLabels: Record<string, string> = {
  group: "Групповая",
  mini_group: "Мини-группа",
  open: "Открытая",
  personal: "Индивидуальная",
};

const defaultFilters: Filters = {
  type: "",
  direction: "",
  coach: "",
  location: "",
  level: "",
};

const RUSSIAN_CONSONANT = /[бвгджзйклмнпрстфхцчшщ]/i;
const LONG_WORD_LIMIT = 12;
const isDev = process.env.NODE_ENV !== "production";

const logSchedule = (...args: unknown[]) => {
  if (isDev) {
    console.log("[schedule]", ...args);
  }
};

const formatSessionTime = (time?: string) => {
  if (!time) return "";
  const [hours = "", minutes = ""] = time.split(":");
  if (!hours || !minutes) {
    return hours || time;
  }
  return `${hours}:${minutes.slice(0, 2)}`;
};

const shortenLongWords = (title?: string) => {
  const source = title?.trim() || "Тренировка";
  return source
    .split(/\s+/)
    .map((word) => {
      if (word.length <= LONG_WORD_LIMIT) return word;
      let cutoff = Math.min(LONG_WORD_LIMIT, word.length);
      while (cutoff > 1 && !RUSSIAN_CONSONANT.test(word[cutoff - 1])) {
        cutoff--;
      }
      if (cutoff === 0) {
        cutoff = LONG_WORD_LIMIT;
      }
      return `${word.slice(0, cutoff)}.`;
    })
    .join(" ");
};

const sortSessionsByDate = (list: TrainingSession[]) =>
  [...list].sort((sessionA, sessionB) => {
    const dateDiff = sessionA.date.localeCompare(sessionB.date);
    if (dateDiff !== 0) return dateDiff;
    return sessionA.start_time.localeCompare(sessionB.start_time);
  });

const getSessionKey = (session: TrainingSession) =>
  `${session.id}-${session.date}-${session.start_time ?? ""}-${session.end_time ?? ""}`;

const mergeSessions = (prev: TrainingSession[], next: TrainingSession[]) => {
  if (!next.length) return prev;
  const map = new Map<string, TrainingSession>();
  prev.forEach((session) => map.set(getSessionKey(session), session));
  next.forEach((session) => map.set(getSessionKey(session), session));
  return sortSessionsByDate(Array.from(map.values()));
};

export default function ScheduleExplorer({ sessions, directions, coaches, locations, levels }: ScheduleExplorerProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const { openLeadModal } = useLeadModal();
  const [autoAdjusted, setAutoAdjusted] = useState(false);
  const [dataSource, setDataSource] = useState<TrainingSession[]>(() => sortSessionsByDate(sessions));

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, idx) => addDays(weekStart, idx)), [weekStart]);

  const filteredSessions = useMemo(() => {
    return dataSource.filter((session) => {
      const sessionDate = parseISO(session.date);
      if (isBefore(sessionDate, weekStart) || isAfter(sessionDate, addDays(weekStart, 6))) {
        return false;
      }
      if (filters.type && session.type !== filters.type) return false;
      if (filters.direction && String(session.direction?.id ?? "") !== filters.direction) return false;
      if (filters.coach && String(session.coach?.id ?? "") !== filters.coach) return false;
      if (filters.location && String(session.location?.id ?? "") !== filters.location) return false;
      if (filters.level && !(session.levels ?? []).some((level) => level.tag === filters.level)) return false;
      return true;
    });
  }, [dataSource, weekStart, filters]);
  const filteredCount = filteredSessions.length;
  const totalSessions = dataSource.length;

  useEffect(() => {
    logSchedule("week start updated", {
      weekStart: format(weekStart, "yyyy-MM-dd"),
      filteredCount,
      totalSessions,
    });
  }, [weekStart, filteredCount, totalSessions]);

  useEffect(() => {
    logSchedule("data source size changed", { totalSessions });
  }, [totalSessions]);

  // Auto-jump to the week of the earliest upcoming session if the current
  // week is empty, to avoid confusing "empty schedule" on first load.
  useEffect(() => {
    if (!autoAdjusted && dataSource.length > 0 && filteredSessions.length === 0) {
      const firstDate = parseISO(dataSource[0].date);
      const newStart = startOfWeek(firstDate, { weekStartsOn: 1 });
      logSchedule("auto-adjust week start", {
        from: format(weekStart, "yyyy-MM-dd"),
        to: format(newStart, "yyyy-MM-dd"),
        firstSessionDate: dataSource[0].date,
      });
      setWeekStart(newStart);
      setAutoAdjusted(true);
    }
  }, [dataSource, filteredSessions, autoAdjusted, weekStart]);

  // If the current visible week has no sessions in the current dataset,
  // fetch just this week's sessions from the API and use them as data source.
  useEffect(() => {
    const start = weekStart;
    const end = addDays(weekStart, 6);
    const inCurrentWeek = (s: TrainingSession) => {
      const d = parseISO(s.date);
      return !(isBefore(d, start) || isAfter(d, end));
    };
    const hasSessionsForWeek = dataSource.some(inCurrentWeek);
    if (hasSessionsForWeek) {
      logSchedule("skip fetch – week already cached", {
        weekStart: format(weekStart, "yyyy-MM-dd"),
        weekEnd: format(end, "yyyy-MM-dd"),
      });
      return;
    }

    const params = new URLSearchParams({
      start: format(start, "yyyy-MM-dd"),
      end: format(end, "yyyy-MM-dd"),
    });

    let cancelled = false;

    logSchedule("fetch week requested", {
      start: params.get("start"),
      end: params.get("end"),
    });

    getTrainingSessions(params).then((res) => {
      if (cancelled || !Array.isArray(res) || res.length === 0) {
        logSchedule("fetch week returned empty", {
          cancelled,
          start: params.get("start"),
          end: params.get("end"),
        });
        return;
      }
      setDataSource((prev) => {
        const merged = mergeSessions(prev, res);
        logSchedule("merged new sessions", {
          added: res.length,
          total: merged.length,
          range: { start: params.get("start"), end: params.get("end") },
        });
        return merged;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [weekStart, dataSource]);

  const dayMap = new Map<string, TrainingSession[]>();
  filteredSessions.forEach((session) => {
    const dateKey = session.date;
    const list = dayMap.get(dateKey) ?? [];
    list.push(session);
    dayMap.set(dateKey, list);
  });

  const availableTypes = Array.from(new Set(dataSource.map((session) => session.type)));
  const hasActiveFilters = Object.values(filters).some(Boolean);

  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <motion.section
      id="schedule"
      className="mt-16 space-y-6"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.75, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/80 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title section-accent">Календарь тренировок</h2>
            <p className="section-subtitle">Выбирайте направление, уровень и локацию — и записывайтесь онлайн.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn-secondary"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
              type="button"
            >
              ← Неделя назад
            </button>
            <button className="btn-secondary" onClick={() => setWeekStart(addDays(weekStart, 7))} type="button">
              Вперёд →
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <select
            value={filters.type}
            onChange={(event) => handleFilterChange("type", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
          >
            <option value="">Формат</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {typeLabels[type] ?? type}
              </option>
            ))}
          </select>
          <select
            value={filters.direction}
            onChange={(event) => handleFilterChange("direction", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
          >
            <option value="">Направление</option>
            {directions.map((direction) => (
              <option key={direction.id} value={direction.id}>
                {direction.title}
              </option>
            ))}
          </select>
          <select
            value={filters.coach}
            onChange={(event) => handleFilterChange("coach", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
          >
            <option value="">Тренер</option>
            {coaches.map((coach) => (
              <option key={coach.id} value={coach.id}>
                {coach.full_name}
              </option>
            ))}
          </select>
          <select
            value={filters.location}
            onChange={(event) => handleFilterChange("location", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
          >
            <option value="">Локация</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.title}
              </option>
            ))}
          </select>
          <select
            value={filters.level}
            onChange={(event) => handleFilterChange("level", event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 shadow-sm focus:border-gabi-blue focus:outline-none focus:ring-2 focus:ring-gabi-blue/40"
          >
            <option value="">Уровень</option>
            {levels.map((level) => (
              <option key={level.id} value={level.tag}>
                {level.name}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button className="text-sm text-gabi-blue hover:underline" onClick={resetFilters} type="button">
            Сбросить фильтры
          </button>
        )}
      </div>

        <motion.div
          className="grid gap-6 md:grid-cols-7"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
        {weekDays.map((day) => {
          const dateKey = format(day, "yyyy-MM-dd");
          const daySessions = (dayMap.get(dateKey) ?? []).sort((a, b) => (a.start_time > b.start_time ? 1 : -1));
          return (
            <motion.div
              key={dateKey}
              className="space-y-3"
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="rounded-2xl bg-white/80 p-3 text-center shadow-sm">
                <div className="text-xs uppercase tracking-widest text-slate-400">
                  {format(day, "EEE", { locale: ru })}
                </div>
                <div className="text-lg font-semibold text-gabi-dark">{format(day, "d MMM", { locale: ru })}</div>
              </div>
              <div className="space-y-3">
                {daySessions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    Нет занятий
                  </div>
                )}
                {daySessions.map((session) => {
                  const startTime = formatSessionTime(session.start_time);
                  const endTime = formatSessionTime(session.end_time);
                  const title = shortenLongWords(session.title || session.direction?.title);
                  const leadMessageTime = startTime || session.start_time || "";
                  return (
                    <motion.div
                      key={session.id}
                      className="group flex h-full flex-col rounded-2xl border border-white/60 bg-white/90 p-4 shadow transition hover:-translate-y-1 hover:shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.2 }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <span className="brand-chip w-fit px-2 py-1 text-[10px]">
                            {typeLabels[session.type] ?? session.type}
                          </span>
                          <div className="text-sm font-semibold text-gabi-blue">
                            {startTime}
                            {startTime && endTime && " – "}
                            {endTime}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gabi-dark">{title}</div>
                          <div className="text-xs text-slate-500">
                            {session.coach?.full_name ?? "Тренер уточняется"} ·{" "}
                            {session.location?.title ?? "Локация уточняется"}
                          </div>
                        </div>
                        {(session.levels?.length ?? 0) > 0 && (
                          <div className="flex flex-wrap gap-1 text-[11px]">
                            {(session.levels ?? []).map((level) => (
                              <span key={level.id} className="brand-chip px-2 py-1">
                                {level.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        className="btn-secondary mt-auto w-full justify-center px-4 py-2 text-[13px] leading-tight"
                        onClick={() =>
                          openLeadModal({
                            source: "schedule",
                            preferred_direction: session.direction?.title ?? "Тренировка",
                            message: `Хочу записаться на занятие ${format(parseISO(session.date), "d MMM", {
                              locale: ru,
                            })} в ${leadMessageTime}`,
                          })
                        }
                        type="button"
                      >
                        Записаться
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
