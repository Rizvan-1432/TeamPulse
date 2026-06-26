"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type BoardMember = {
  userId: string;
  role: "OWNER" | "EDITOR" | "VIEWER";
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

type BoardSettingsProps = {
  boardId: string;
  initialTitle: string;
  isOwner: boolean;
  members: BoardMember[];
};

export function BoardSettings({
  boardId,
  initialTitle,
  isOwner,
  members,
}: BoardSettingsProps) {
  const router = useRouter();
  const hasInvitees = members.some(
    (member) => member.role === "EDITOR" || member.role === "VIEWER",
  );
  const [open, setOpen] = useState(isOwner && !hasInvitees);
  const [inviteRole, setInviteRole] = useState<"EDITOR" | "VIEWER">("EDITOR");
  const [title, setTitle] = useState(initialTitle);
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRename(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Не удалось переименовать");
        return;
      }

      router.refresh();
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить доску и все карточки? Это нельзя отменить.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/boards/${boardId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      const data = await res.json();
      setError(data.error ?? "Не удалось удалить");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/boards/${boardId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Не удалось пригласить");
        return;
      }

      setInviteEmail("");
      router.refresh();
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("Убрать участника с доски?")) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/boards/${boardId}/members?userId=${userId}`,
        { method: "DELETE" },
      );
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Не удалось удалить участника");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6 border-white/10 bg-zinc-900/50 sm:mb-8">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">Настройки доски</CardTitle>
            <CardDescription>
              {isOwner
                ? "Переименование, команда и удаление"
                : "Участники доски"}
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Скрыть" : "Открыть"}
          </Button>
        </div>
      </CardHeader>

      {open && (
        <CardContent className="space-y-6">
          {isOwner && !hasInvitees && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              Доска видна только вам. Чтобы коллега увидел её на своём dashboard,
              пригласите его по email ниже — он должен быть зарегистрирован в
              TeamPulse.
            </p>
          )}

          {isOwner && (
            <form onSubmit={handleRename} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="board-rename">Название доски</Label>
                <Input
                  id="board-rename"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" size="sm" disabled={loading || !title.trim()}>
                Сохранить название
              </Button>
            </form>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-zinc-200">Команда</h3>
            <ul className="space-y-2">
              {members.map((member) => (
                <li
                  key={member.userId}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {member.user.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                        member.role === "OWNER"
                          ? "bg-indigo-500/20 text-indigo-300"
                          : "bg-zinc-500/20 text-zinc-400",
                      )}
                    >
                      {member.role === "OWNER"
                        ? "Владелец"
                        : member.role === "EDITOR"
                          ? "Редактор"
                          : "Наблюдатель"}
                    </span>
                    {isOwner &&
                      (member.role === "EDITOR" || member.role === "VIEWER") && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        className="text-xs text-zinc-500 hover:text-rose-400"
                        disabled={loading}
                      >
                        Убрать
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Пригласить по email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-zinc-500">
                  Пользователь должен быть уже зарегистрирован в TeamPulse
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Роль</Label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "EDITOR" | "VIEWER")
                  }
                  disabled={loading}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <option value="EDITOR">Редактор — может менять карточки</option>
                  <option value="VIEWER">Наблюдатель — только просмотр</option>
                </select>
              </div>
              <Button
                type="submit"
                size="sm"
                disabled={loading || !inviteEmail.trim()}
              >
                Пригласить
              </Button>
            </form>
          )}

          {isOwner && (
            <div className="border-t border-white/10 pt-4">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                Удалить доску
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
}
