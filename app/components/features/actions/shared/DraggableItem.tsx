import {
  useDraggable,
  useDroppable,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { is } from "date-fns/locale";
import { GripVerticalIcon } from "lucide-react";
import React from "react";
import { cn } from "~/lib/ui";
import { ActionItem, type NewActionProps } from "../ActionItem";

export const DraggableItem = ({
  id,
  children,
  handle,
}: {
  id: UniqueIdentifier;
  children: React.ReactElement<NewActionProps>;
  handle?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
  };
  return (
    <div
      ref={setNodeRef}
      style={isDragging ? undefined : style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative",
        !handle && isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      {React.cloneElement(children, { isDragging })}
      {handle && (
        <button
          className={cn(
            "bg-card absolute top-1 right-1 z-10 rounded-sm p-1 opacity-0 group-hover:opacity-100",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      )}
    </div>
  );
};

export const SortableItem = ({
  id,
  children,
  handle,
}: {
  id: UniqueIdentifier;
  children: React.ReactNode;
  handle?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative",
        isDragging && "opacity-10",
        !handle && isDragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      {children}
      {handle && (
        <button
          className={cn(
            "bg-card absolute top-1 right-1 z-10 rounded-sm p-1 opacity-0 group-hover:opacity-100",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
        >
          <GripVerticalIcon className="size-4" />
        </button>
      )}
    </div>
  );
};
