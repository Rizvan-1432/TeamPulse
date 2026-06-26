import Link from "next/link";

import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  email?: string | null;
  backHref?: string;
  backLabel?: string;
};

export function AppHeader({ email, backHref, backLabel }: AppHeaderProps) {
  return (
    <header className="border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center justify-between gap-2 sm:justify-start sm:gap-4">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold">
              TP
            </div>
            <span className="font-semibold">TeamPulse</span>
          </Link>
          {backHref && backLabel && (
            <Link
              href={backHref}
              className="truncate text-sm text-zinc-400 transition-colors hover:text-white sm:hidden"
            >
              ← Назад
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
          {backHref && backLabel && (
            <Link
              href={backHref}
              className="hidden text-sm text-zinc-400 transition-colors hover:text-white sm:inline"
            >
              ← {backLabel}
            </Link>
          )}
          {email && (
            <span className="min-w-0 truncate text-xs text-zinc-400 sm:max-w-[220px] sm:text-sm">
              {email}
            </span>
          )}
          <form
            action={async () => {
              "use server";
              const { signOut } = await import("@/auth");
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="outline" size="sm" type="submit">
              Выйти
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
