'use client';

import { type ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

/**
 * A reorderable stack of rows.
 *
 * Order is not cosmetic here — it is the order the customer sees options in on
 * the product page, so it is worth being able to set directly rather than by
 * editing a number. The keyboard sensor is included deliberately: a
 * drag-and-drop list with no keyboard path is unusable for anyone who cannot
 * use a pointer, and this is the only way to set that order.
 *
 * A pointer has to travel 6px before a drag starts, so a tap on a delete
 * button inside a row is still a tap.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode;
  className?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over.id);
    if (from === -1 || to === -1) return;

    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={cn('flex flex-col', className)}>
          {items.map((item, index) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, index, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({ id, children }: { id: string; children: (handle: ReactNode) => ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const handle = (
    <button
      ref={setActivatorNodeRef}
      type="button"
      aria-label="Reorder"
      {...attributes}
      {...listeners}
      className="grid size-8 shrink-0 cursor-grab place-items-center rounded-lg text-ink-subtle hover:bg-plum-tint active:cursor-grabbing"
    >
      <GripDots />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 rounded-xl bg-background shadow-md')}
    >
      {children(handle)}
    </div>
  );
}

/** The six-dot grip drawn in the approved screens. */
function GripDots() {
  return (
    <svg viewBox="0 0 10 16" className="size-4" fill="currentColor" aria-hidden>
      {[2, 8].map((x) =>
        [3, 8, 13].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.35" />),
      )}
    </svg>
  );
}
