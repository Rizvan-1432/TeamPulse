export type Priority = "LOW" | "MEDIUM" | "HIGH";

export type KanbanCard = {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  dueAt: string | null;
  order: number;
};

export type KanbanColumn = {
  id: string;
  title: string;
  order: number;
  cards: KanbanCard[];
};

export const priorityLabels: Record<Priority, string> = {
  LOW: "Низкий",
  MEDIUM: "Средний",
  HIGH: "Высокий",
};

export const priorityStyles: Record<Priority, string> = {
  LOW: "bg-emerald-500/15 text-emerald-300",
  MEDIUM: "bg-amber-500/15 text-amber-300",
  HIGH: "bg-rose-500/15 text-rose-300",
};

export const roleLabels: Record<string, string> = {
  OWNER: "Владелец",
  EDITOR: "Редактор",
  VIEWER: "Наблюдатель",
};
