"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type KanbanCard,
  type Priority,
  priorityLabels,
  priorityStyles,
} from "@/lib/kanban-types";
import { cn } from "@/lib/utils";

type CardModalProps = {
  card: KanbanCard | null;
  canEdit: boolean;
  onClose: () => void;
};

function CardModalForm({
  card,
  canEdit,
  onClose,
}: {
  card: KanbanCard;
  canEdit: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? "");
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [dueAt, setDueAt] = useState(card.dueAt ? card.dueAt.slice(0, 10) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          priority,
          dueAt: dueAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Ошибка сохранения");
        return;
      }
      onClose();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить карточку?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${card.id}`, { method: "DELETE" });
      if (res.ok) {
        onClose();
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 id="card-modal-title" className="text-lg font-semibold">
          {canEdit ? "Карточка" : "Просмотр карточки"}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-zinc-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="modal-title">Название</Label>
          <Input
            id="modal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={!canEdit || loading}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="modal-desc">Описание</Label>
          <Input
            id="modal-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!canEdit || loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="modal-priority">Приоритет</Label>
            <select
              id="modal-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              disabled={!canEdit || loading}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            >
              <option value="LOW">Низкий</option>
              <option value="MEDIUM">Средний</option>
              <option value="HIGH">Высокий</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-due">Дедлайн</Label>
            <Input
              id="modal-due"
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              disabled={!canEdit || loading}
            />
          </div>
        </div>

        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
            priorityStyles[priority],
          )}
        >
          {priorityLabels[priority]}
        </span>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {canEdit && (
            <>
              <Button onClick={handleSave} disabled={loading || !title.trim()}>
                {loading ? "..." : "Сохранить"}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Удалить
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Закрыть
          </Button>
        </div>
      </div>
    </>
  );
}

export function CardModal({ card, canEdit, onClose }: CardModalProps) {
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-900 p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-modal-title"
      >
        <CardModalForm
          key={card.id}
          card={card}
          canEdit={canEdit}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
