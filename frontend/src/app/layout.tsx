import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Gabi Club',
    description: 'Твое пространство для спорта и приключений',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="ru">
        <body className="min-h-screen bg-white text-black antialiased">
        {children}
        </body>
        </html>
    )
}