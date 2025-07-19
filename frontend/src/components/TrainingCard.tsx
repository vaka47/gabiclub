"use client"; // если App Router

import React from "react";

type Props = {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    type: "group" | "open";
    direction: string;
    coach: string;
    location: string;
    levels: string[];
    onClick?: () => void;
};

const typeColors: Record<Props["type"], string> = {
    group: "bg-blue-100 text-blue-700",
    open: "bg-green-100 text-green-700",
};

const levelIcons: Record<string, string> = {
    начальный: "🟢",
    средний: "🟡",
    продвинутый: "🔴",
    "любой уровень": "⚪",
};

export default function TrainingCard({
                                         date,
                                         startTime,
                                         endTime,
                                         duration,
                                         type,
                                         direction,
                                         coach,
                                         location,
                                         levels,
                                         onClick,
                                     }: Props) {
    return (
        <div
            onClick={onClick}
            className={`rounded-xl border p-4 bg-white shadow-sm hover:shadow-lg transition cursor-pointer flex flex-col gap-2 ${
                onClick ? "hover:ring-2 hover:ring-primary" : ""
            }`}
        >
            <div className="flex justify-between text-xs text-gray-500">
                <span>{date}</span>
                <span>
          {startTime} – {endTime} ({duration} мин)
        </span>
            </div>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{direction}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[type]}`}>
          {type === "group" ? "Групповая" : "Открытая"}
        </span>
            </div>

            <div className="text-sm text-gray-600">Тренер: {coach}</div>
            <div className="text-sm text-gray-600">Локация: {location}</div>

            <div className="flex flex-wrap gap-2 mt-2">
                {(levels || []).map((lvl, i) => (
                    <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800 border border-gray-300"
                    >
            {levelIcons[lvl.toLowerCase()] || "🔘"} {lvl}
          </span>
                ))}
            </div>
        </div>
    );
}
