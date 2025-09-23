import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  rectSwappingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { forwardRef, useState } from "react";
import { redirect, useLoaderData, type LoaderFunctionArgs } from "react-router";
import { createClient } from "~/lib/database/supabase";
import { cn } from "~/lib/ui";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { supabase } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const start = startOfWeek(startOfMonth(new Date()));
  const end = endOfDay(endOfWeek(endOfMonth(new Date())));

  const [
    { data: actions },
    { data: states },
    { data: partners },
    { data: people },
    { data: priorities },
    { data: categories },
    { data: areas },
  ] = await Promise.all([
    supabase
      .from("actions")
      .select("*")
      .containedBy("partners", ["clinicadengo"])
      .gte("date", format(start, "yyyy-MM-dd HH:mm:ss"))
      .lte("date", format(end, "yyyy-MM-dd HH:mm:ss"))
      .order("title", { ascending: true }),
    supabase.from("states").select("*"),
    supabase.from("partners").select("*"),
    supabase.from("people").select("*"),
    supabase.from("priorities").select("*"),
    supabase.from("categories").select("*"),
    supabase.from("areas").select("*"),
  ]);

  const person = people?.find((person: Person) => person.user_id === user.id);

  return {
    actions,
    states,
    partners,
    people,
    priorities,
    categories,
    areas,
    person,

    start,
    end,
  };
};

export default function SortablePage() {
  const { actions } = useLoaderData<typeof loader>();

  const [images, setImages] = useState([
    { id: 1, title: "Image 1", color: "#f9c74f" },
    { id: 2, title: "Image 2", color: "#e76f51" },
    { id: 3, title: "Image 3", color: "#955251" },
    { id: 4, title: "Image 4", color: "#6f8651" },
    { id: 5, title: "Image 5", color: "#556e76" },
    { id: 6, title: "Image 6", color: "#34495e" },
    { id: 7, title: "Image 7", color: "#2980b9" },
    { id: 8, title: "Image 8", color: "#6f8651" },
    { id: 9, title: "Image 9", color: "#556e76" },
    { id: 10, title: "Image 10", color: "#34495e" },
    { id: 11, title: "Image 11", color: "#2980b9" },
  ]);

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;

    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = images.findIndex((item) => item.id === active.id);
      const newIndex = images.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(images, oldIndex, newIndex);

      setImages(newItems);
    }
  }

  return (
    <div className="flex">
      <div className="w-full shrink border-r"></div>
      <div className="container mx-auto min-h-screen shrink-0">
        <h1 className="border_after border_before relative p-8 text-3xl">
          Sortable
        </h1>
        <div className="flex">
          <DndContext
            collisionDetection={closestCorners}
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((image) => image.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid w-full grid-cols-5 gap-2 p-4">
                {images.map((image) => (
                  <SortableItem key={image.id} image={image} id={image.id} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay
              dropAnimation={{ duration: 150, easing: "ease-in-out" }}
            >
              {activeId ? (
                <Item
                  image={images.find((image) => image.id === activeId)!}
                  isOverlay
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
      <div className="w-full shrink border-l"></div>
    </div>
  );
}

function SortableItem({
  image,
  id,
}: {
  image: { id: number; title: string; color: string };
  id: UniqueIdentifier;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Item image={image} isDragging={isDragging} />
    </div>
  );
}

const Item = ({
  image,
  isDragging,
  isOverlay,
}: {
  image: { id: number; title: string; color: string };
  isDragging?: boolean;
  isOverlay?: boolean;
}) => {
  return (
    <div
      className={cn(
        "bg-card grid place-content-center rounded-xs p-8 text-2xl text-white shadow",
        isDragging ? "opacity-50" : "",
        isOverlay ? "opacity-90" : "",
      )}
      style={{ backgroundColor: image.color }}
    >
      {image.title}
    </div>
  );
};
