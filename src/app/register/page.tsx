import { AuthForm } from "@/components/auth-form";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-zinc-300 hover:text-white"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white">
          TP
        </div>
        <span className="font-semibold">TeamPulse</span>
      </Link>
      <AuthForm mode="register" />
    </div>
  );
}
