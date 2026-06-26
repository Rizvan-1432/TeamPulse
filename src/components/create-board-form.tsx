"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateBoardForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Не удалось создать доску");
        return;
      }

      setTitle("");
      router.push(`/boards/${data.board.id}`);
      router.refresh();
    } catch {
      setError("Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-900/50 p-4 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="board-title">Название доски</Label>
        <Input
          id="board-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Product Sprint"
          required
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto" disabled={loading || !title.trim()}>
        {loading ? "Создание..." : "+ Новая доска"}
      </Button>
      {error && (
        <p className="text-sm text-destructive sm:basis-full" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
