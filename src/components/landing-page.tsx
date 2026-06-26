import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function KanbanPreview() {
  const columns = [
    {
      title: "To Do",
      cards: ["Дизайн landing", "Настроить auth"],
    },
    {
      title: "In Progress",
      cards: ["Kanban UI"],
    },
    {
      title: "Done",
      cards: ["Next.js setup", "Prisma schema"],
    },
  ];

  return (
    <div className="-mx-1 overflow-x-auto pb-2 [scrollbar-width:thin] md:overflow-visible">
      <div className="flex snap-x snap-mandatory gap-3 md:grid md:snap-none md:grid-cols-3 md:gap-4">
      {columns.map((column) => (
        <div
          key={column.title}
          className="w-[min(75vw,16rem)] shrink-0 snap-center rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur md:w-auto"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-200">{column.title}</h3>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
              {column.cards.length}
            </span>
          </div>
          <div className="space-y-2">
            {column.cards.map((card) => (
              <div
                key={card}
                className="rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-100 shadow-lg"
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="relative min-h-full overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.15),_transparent_35%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 font-bold">
            TP
          </div>
          <span className="truncate text-base font-semibold tracking-tight sm:text-lg">
            TeamPulse
          </span>
        </div>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden text-zinc-300 hover:text-white sm:inline-flex",
            )}
          >
            Вход
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-indigo-500 hover:bg-indigo-400 sm:text-sm",
            )}
          >
            <span className="sm:hidden">Старт</span>
            <span className="hidden sm:inline">Начать бесплатно</span>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-200">
              Real-time Kanban для команд
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
              Задачи команды —
              <span className="bg-gradient-to-r from-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                {" "}
                в одном ритме
              </span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:mt-6 sm:text-lg">
              TeamPulse — mini-SaaS для небольших команд: канбан-доска,
              drag-and-drop и синхронизация статусов в реальном времени.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "w-full bg-indigo-500 hover:bg-indigo-400 sm:w-auto",
                )}
              >
                Создать доску
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "w-full border-white/15 bg-transparent text-zinc-100 hover:bg-white/5 sm:w-auto",
                )}
              >
                Войти
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2 text-center sm:mt-10 sm:max-w-md sm:gap-4">
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">3</p>
                <p className="text-[10px] text-zinc-500 sm:text-xs">колонки из коробки</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">Live</p>
                <p className="text-[10px] text-zinc-500 sm:text-xs">real-time sync</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white sm:text-2xl">Fullstack</p>
                <p className="text-[10px] text-zinc-500 sm:text-xs">Next.js + PostgreSQL</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-3 shadow-2xl backdrop-blur sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-400/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
              <div className="h-3 w-3 rounded-full bg-green-400/80" />
              <span className="ml-2 text-xs text-zinc-500">Product Sprint</span>
            </div>
            <KanbanPreview />
          </div>
        </section>

        <section className="mt-16 grid gap-4 sm:mt-24 sm:gap-6 md:grid-cols-3">
          {[
            {
              title: "Drag & Drop",
              text: "Перетаскивайте карточки между колонками — статус меняется мгновенно.",
            },
            {
              title: "Real-time",
              text: "Изменения видны всей команде без перезагрузки страницы.",
            },
            {
              title: "Fullstack",
              text: "Next.js, Prisma, PostgreSQL, авторизация и деплой на Vercel.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {feature.text}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
