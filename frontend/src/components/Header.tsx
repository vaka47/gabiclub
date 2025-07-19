"use client"

import Link from "next/link"

export default function Header() {
    return (
        <header className="w-full border-b bg-white shadow-sm fixed top-0 left-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-pink-600 font-semibold text-lg">
                    GabiClub
                </Link>

                {/* Nav */}
                <nav className="space-x-6 text-sm font-medium text-gray-700">
                    <Link href="/schedule" className="hover:text-pink-600 transition">
                        Тренировки
                    </Link>
                    <Link href="/camps" className="hover:text-pink-600 transition">
                        Кэмпы
                    </Link>
                    <Link href="/blog" className="hover:text-pink-600 transition">
                        Блог
                    </Link>
                    <Link href="/about" className="hover:text-pink-600 transition">
                        О клубе
                    </Link>
                </nav>
            </div>
        </header>
    )
}
