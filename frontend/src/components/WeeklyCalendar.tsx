"use client";

import { useEffect, useState } from "react";
import TrainingCard from "./TrainingCard";

type TrainingSession = {
    id: number;
    date: string;
    start_time: string;
    end_time: string;
    duration: number;
    type: "group" | "open";
    direction: string;
    coach: string;
    location: string;
    levels: string[];
};

export function WeeklyCalendar() {
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [weekStart, setWeekStart] = useState(() => {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // понедельник
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday;
    });

    useEffect(() => {
        const startStr = weekStart.toISOString().split("T")[0];
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        const endStr = end.toISOString().split("T")[0];

        fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/schedule/?start=${startStr}&end=${endStr}`
        )
            .then((res) => res.json())
            .then(setSessions);
    }, [weekStart]);

    const days = [...Array(7)].map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const goToPreviousWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() - 7);
        setWeekStart(newDate);
    };

    const goToNextWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() + 7);
        setWeekStart(newDate);
    };

    return (
        <div className="space-y-6">
            {/* Навигация по неделям */}
            <div className="flex justify-between items-center">
                <button
                    onClick={goToPreviousWeek}
                    className="text-sm text-blue-600 hover:underline"
                >
                    ← Предыдущая неделя
                </button>
                <h2 className="text-xl font-semibold text-center">
                    {weekStart.toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                    })}{" "}
                    –{" "}
                    {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString(
                        "ru-RU",
                        { day: "numeric", month: "long" }
                    )}
                </h2>
                <button
                    onClick={goToNextWeek}
                    className="text-sm text-blue-600 hover:underline"
                >
                    Следующая неделя →
                </button>
            </div>

            {/* Сетка дней и тренировок */}
            <div className="grid grid-cols-7 gap-4">
                {days.map((day) => {
                    const dateStr = day.toISOString().split("T")[0];
                    const daySessions = sessions.filter((s) => s.date === dateStr);

                    return (
                        <div key={dateStr}>
                            <h3 className="text-center font-semibold text-gray-800">
                                {day.toLocaleDateString("ru-RU", {
                                    weekday: "short",
                                    day: "numeric",
                                })}
                            </h3>
                            <div className="mt-2 flex flex-col gap-2">
                                {daySessions.map((s) => (
                                    <TrainingCard
                                        key={s.id}
                                        date={s.date}
                                        startTime={s.start_time}
                                        endTime={s.end_time}
                                        duration={s.duration}
                                        type={s.type}
                                        direction={s.direction}
                                        coach={s.coach}
                                        location={s.location}
                                        levels={s.levels}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
