"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { ActivityPanel } from "@/components/activity-panel";
import { BoardToolbar } from "@/components/board-toolbar";
import { CardModal } from "@/components/card-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveIndicator } from "@/components/live-indicator";
import { useBoardRealtime } from "@/hooks/use-board-realtime";
import {
  type KanbanCard,
  type KanbanColumn,
  type Priority,
  priorityLabels,
  priorityStyles,
} from "@/lib/kanban-types";
import { cn } from "@/lib/utils";

type KanbanBoardProps = {
  boardId: string;
  currentUserId: string;
  canEdit: boolean;
  columns: KanbanColumn[];
};

type ColumnItems = Record<string, KanbanCard[]>;

function columnDroppableId(columnId: string) {
  return `column:${columnId}`;
}

function parseColumnDroppableId(id: string) {
  return id.startsWith("column:") ? id.slice("column:".length) : null;
}

function columnsToItems(columns: KanbanColumn[]): ColumnItems {
  return Object.fromEntries(columns.map((col) => [col.id, col.cards]));
}

function findColumnId(items: ColumnItems, cardId: string) {
  return Object.keys(items).find((columnId) =>
    items[columnId].some((card) => card.id === cardId),
  );
}

function filterCards(
  cards: KanbanCard[],
  search: string,
  priorityFilter: Priority | "ALL",
) {
  const q = search.trim().toLowerCase();
  return cards.filter((card) => {
    if (priorityFilter !== "ALL" && card.priority !== priorityFilter) {
      return false;
    }
    if (!q) return true;
    return (
      card.title.toLowerCase().includes(q) ||
      (card.description?.toLowerCase().includes(q) ?? false)
    );
  });
}

function formatDue(dueAt: string | null) {
  if (!dueAt) return null;
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
  }).format(new Date(dueAt));
}

async function persistCardMove(
  cardId: string,
  columnId: string,
  order: number,
) {
  await fetch(`/api/cards/${cardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columnId, order }),
  });
}

function CardPreview({
  card,
  isDragging,
  onClick,
}: {
  card: KanbanCard;
  isDragging?: boolean;
  onClick: () => void;
}) {
  const due = formatDue(card.dueAt);
  const overdue = Boolean(card.dueAt && new Date(card.dueAt) < new Date());

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border border-white/10 bg-zinc-900/90 p-3 text-left shadow-lg transition-colors hover:border-indigo-500/30",
        isDragging && "opacity-50 ring-2 ring-indigo-500/40",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
            priorityStyles[card.priority],
          )}
        >
          {priorityLabels[card.priority]}
        </span>
        {due && (
          <span
            className={cn(
              "text-[10px]",
              overdue ? "text-rose-400" : "text-zinc-500",
            )}
          >
            {due}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-zinc-100">{card.title}</p>
      {card.description && (
        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
          {card.description}
        </p>
      )}
    </button>
  );
}

function SortableKanbanCard({
  card,
  canEdit,
  onOpen,
}: {
  card: KanbanCard;
  canEdit: boolean;
  onOpen: (card: KanbanCard) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, disabled: !canEdit });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...(canEdit ? { ...attributes, ...listeners } : {})}
    >
      <CardPreview
        card={card}
        isDragging={isDragging}
        onClick={() => onOpen(card)}
      />
    </div>
  );
}

function KanbanColumnView({
  column,
  cards,
  canEdit,
  onOpenCard,
}: {
  column: KanbanColumn;
  cards: KanbanCard[];
  canEdit: boolean;
  onOpenCard: (card: KanbanCard) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(column.id),
    data: { type: "column", columnId: column.id },
  });

  const cardIds = useMemo(() => cards.map((card) => card.id), [cards]);

  return (
    <div
      className={cn(
        "flex min-h-[min(70vh,520px)] w-[min(85vw,20rem)] shrink-0 snap-center flex-col rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur transition-colors sm:w-72 sm:p-4 md:min-h-[420px] md:w-auto md:shrink",
        isOver && canEdit && "border-indigo-500/40 bg-indigo-500/5",
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">{column.title}</h2>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-zinc-400">
          {cards.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex flex-1 flex-col gap-2">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableKanbanCard
              key={card.id}
              card={card}
              canEdit={canEdit}
              onOpen={onOpenCard}
            />
          ))}
        </SortableContext>
        {canEdit && <AddCardForm columnId={column.id} />}
      </div>
    </div>
  );
}

function AddCardForm({ columnId }: { columnId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueAt, setDueAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId,
          title,
          description: description || undefined,
          priority,
          dueAt: dueAt || undefined,
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setPriority("MEDIUM");
        setDueAt("");
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-dashed border-white/15 px-3 py-2 text-sm text-zinc-400 transition-colors hover:border-white/30 hover:text-zinc-200"
      >
        + Добавить карточку
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-white/10 bg-zinc-900/60 p-3"
    >
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название"
        required
        disabled={loading}
      />
      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Описание"
        disabled={loading}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          disabled={loading}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm dark:bg-input/30"
        >
          <option value="LOW">Низкий</option>
          <option value="MEDIUM">Средний</option>
          <option value="HIGH">Высокий</option>
        </select>
        <Input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          disabled={loading}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !title.trim()}>
          Добавить
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setOpen(false)}
        >
          Отмена
        </Button>
      </div>
    </form>
  );
}

export function KanbanBoard({
  boardId,
  currentUserId,
  canEdit,
  columns,
}: KanbanBoardProps) {
  const router = useRouter();
  const serverItems = useMemo(() => columnsToItems(columns), [columns]);
  const [draftItems, setDraftItems] = useState<ColumnItems | null>(null);
  const items = draftItems ?? serverItems;
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const [modalCard, setModalCard] = useState<KanbanCard | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "ALL">("ALL");

  const syncBoard = useCallback(async () => {
    const res = await fetch(`/api/boards/${boardId}`);
    if (!res.ok) return;
    const data = (await res.json()) as { board: { columns: KanbanColumn[] } };
    setDraftItems(columnsToItems(data.board.columns));
  }, [boardId]);

  const { status, onDragStart, onDragEnd } = useBoardRealtime(
    boardId,
    currentUserId,
    syncBoard,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
  );

  const displayItems = useMemo(() => {
    const result: ColumnItems = {};
    for (const column of columns) {
      result[column.id] = filterCards(
        items[column.id] ?? [],
        search,
        priorityFilter,
      );
    }
    return result;
  }, [columns, items, search, priorityFilter]);

  function handleDragStart(event: DragStartEvent) {
    if (!canEdit) return;
    onDragStart();
    const cardId = String(event.active.id);
    for (const columnCards of Object.values(items)) {
      const card = columnCards.find((item) => item.id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  }

  function handleDragOver(event: DragOverEvent) {
    if (!canEdit) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    setDraftItems((prev) => {
      const current = prev ?? serverItems;
      const activeColumnId = findColumnId(current, activeId);
      const overColumnId =
        findColumnId(current, overId) ?? parseColumnDroppableId(overId);

      if (!activeColumnId || !overColumnId || activeColumnId === overColumnId) {
        return prev;
      }

      const sourceCards = [...current[activeColumnId]];
      const targetCards = [...current[overColumnId]];
      const activeIndex = sourceCards.findIndex((card) => card.id === activeId);
      if (activeIndex === -1) return prev;

      const overIndex = overId.startsWith("column:")
        ? targetCards.length
        : targetCards.findIndex((card) => card.id === overId);

      const [movedCard] = sourceCards.splice(activeIndex, 1);
      const insertIndex = overIndex >= 0 ? overIndex : targetCards.length;
      targetCards.splice(insertIndex, 0, movedCard);

      return {
        ...current,
        [activeColumnId]: sourceCards,
        [overColumnId]: targetCards,
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!canEdit) return;
    const { active, over } = event;
    setActiveCard(null);
    if (!over) {
      onDragEnd();
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    setDraftItems((prev) => {
      const current = prev ?? serverItems;
      const activeColumnId = findColumnId(current, activeId);
      const overColumnId =
        findColumnId(current, overId) ?? parseColumnDroppableId(overId);

      if (!activeColumnId || !overColumnId) return prev;

      let nextItems = current;

      if (activeColumnId === overColumnId && !overId.startsWith("column:")) {
        const activeIndex = current[activeColumnId].findIndex(
          (c) => c.id === activeId,
        );
        const overIndex = current[overColumnId].findIndex(
          (c) => c.id === overId,
        );
        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          nextItems = {
            ...current,
            [activeColumnId]: arrayMove(
              current[activeColumnId],
              activeIndex,
              overIndex,
            ),
          };
        }
      }

      const finalColumnId = findColumnId(nextItems, activeId);
      if (!finalColumnId) return prev ?? nextItems;

      const finalIndex = nextItems[finalColumnId].findIndex(
        (c) => c.id === activeId,
      );
      if (finalIndex === -1) return prev ?? nextItems;

      const originalColumn = columns.find((col) =>
        col.cards.some((c) => c.id === activeId),
      );
      const originalIndex = originalColumn?.cards.findIndex(
        (c) => c.id === activeId,
      );

      if (
        originalColumn?.id !== finalColumnId ||
        originalIndex !== finalIndex
      ) {
        void persistCardMove(activeId, finalColumnId, finalIndex).then(() => {
          setDraftItems(null);
          router.refresh();
        });
      }

      return nextItems;
    });

    onDragEnd();
  }

  return (
    <div className="space-y-4">
      <BoardToolbar
        search={search}
        priorityFilter={priorityFilter}
        onSearchChange={setSearch}
        onPriorityChange={setPriorityFilter}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-zinc-500 md:hidden">
          Свайпните влево/вправо для других колонок
        </p>
        {!canEdit && (
          <p className="text-xs text-amber-300">Режим просмотра</p>
        )}
        <div className="ml-auto">
          <LiveIndicator status={status} />
        </div>
      </div>

      <ActivityPanel boardId={boardId} />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:thin] md:mx-0 md:overflow-visible md:px-0 md:pb-0">
          <div className="flex snap-x snap-mandatory gap-3 md:grid md:snap-none md:grid-cols-3 md:gap-4">
            {columns.map((column) => (
              <KanbanColumnView
                key={column.id}
                column={column}
                cards={displayItems[column.id] ?? []}
                canEdit={canEdit}
                onOpenCard={setModalCard}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <div className="w-[min(85vw,20rem)] sm:w-72">
              <CardPreview card={activeCard} onClick={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <CardModal
        card={modalCard}
        canEdit={canEdit}
        onClose={() => setModalCard(null)}
      />
    </div>
  );
}
