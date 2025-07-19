export default function HeroSection() {
    return (
        <section className="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-pink-100 to-white pt-20 px-4">

        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-2xl">
                Твое <span className="text-pink-600">пространство</span> для спорта и приключений
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mt-6 max-w-xl">
                Тренировки, кэмпы, блог и вдохновение. Добро пожаловать в Gabi Club.
            </p>
            <a
                href="#contact"
                className="mt-8 px-6 py-3 rounded-full bg-pink-500 text-white font-medium hover:bg-pink-600 transition"
            >
                Связаться с нами
            </a>
        </section>
    )
}
