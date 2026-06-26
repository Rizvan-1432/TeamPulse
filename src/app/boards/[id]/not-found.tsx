import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function BoardNotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <h1 className="text-2xl font-bold">Доска не найдена</h1>
      <p className="mt-2 max-w-md text-center text-zinc-400">
        Возможно, она была удалена или у вас нет доступа. Попробуйте войти
        снова.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Мои доски
        </Link>
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Войти
        </Link>
      </div>
    </div>
  );
}
