"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Priority } from "@/lib/kanban-types";

type BoardToolbarProps = {
  search: string;
  priorityFilter: Priority | "ALL";
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: Priority | "ALL") => void;
};

export function BoardToolbar({
  search,
  priorityFilter,
  onSearchChange,
  onPriorityChange,
}: BoardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="card-search" className="text-xs">
          Поиск по карточкам
        </Label>
        <Input
          id="card-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Название или описание..."
        />
      </div>
      <div className="space-y-2 sm:w-44">
        <Label htmlFor="priority-filter" className="text-xs">
          Приоритет
        </Label>
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={(e) =>
            onPriorityChange(e.target.value as Priority | "ALL")
          }
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
        >
          <option value="ALL">Все</option>
          <option value="LOW">Низкий</option>
          <option value="MEDIUM">Средний</option>
          <option value="HIGH">Высокий</option>
        </select>
      </div>
    </div>
  );
}
