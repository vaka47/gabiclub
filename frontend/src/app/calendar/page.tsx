import { WeeklyCalendar } from '@/components/WeeklyCalendar'

export default function CalendarPage() {
    return (
        <main className="p-4">
            <h1 className="text-2xl font-bold mb-4">Календарь тренировок</h1>
            <WeeklyCalendar />
        </main>
    )
}
