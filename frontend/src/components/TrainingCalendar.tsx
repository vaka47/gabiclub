// components/TrainingCalendar.tsx
'use client'

import { Calendar, Views } from 'react-big-calendar'
import { localizer } from '@/lib/calendarLocalizer'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useEffect, useState } from 'react'

type TrainingEvent = {
    id: number
    title: string
    start: Date
    end: Date
    resource: {
        coach: string
        location: string
        direction: string
        level: string
    }
}

export default function TrainingCalendar() {
    const [events, setEvents] = useState<TrainingEvent[]>([])

    useEffect(() => {
        // Получи тренировки с API и преобразуй их:
        fetch('/api/trainings')
            .then((res) => res.json())
            .then((data) => {
                const parsed: TrainingEvent[] = data.map((item: any) => ({
                    id: item.id,
                    title: item.title ?? `${item.type} (${item.direction})`,
                    start: new Date(item.date + 'T' + item.start_time),
                    end: new Date(item.date + 'T' + item.end_time),
                    resource: {
                        coach: item.coach_name,
                        location: item.location_name,
                        direction: item.direction_name,
                        level: item.level_name,
                    },
                }))
                setEvents(parsed)
            })
    }, [])

    return (
        <div className="p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={['week']}
                defaultView={Views.WEEK}
                style={{ height: 700 }}
                messages={{
                    week: 'Неделя',
                    day: 'День',
                    today: 'Сегодня',
                    previous: '←',
                    next: '→',
                }}
                eventPropGetter={(event) => {
                    return {
                        style: {
                            backgroundColor: '#90EE90',
                            borderRadius: '6px',
                            padding: '4px',
                            color: '#000',
                            fontWeight: '500',
                        },
                    }
                }}
                components={{
                    event: ({ event }: { event: TrainingEvent }) => (
                        <div>
                            <strong>{event.title}</strong>
                            <div>{event.resource.coach}</div>
                            <div>{event.resource.location}</div>
                        </div>
                    ),
                }}
            />
        </div>
    )
}
