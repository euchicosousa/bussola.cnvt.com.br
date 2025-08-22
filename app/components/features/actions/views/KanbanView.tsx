import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useId } from "react";
import { useMatches, useSubmit } from "react-router";
import { INTENTS } from "~/lib/constants";
import { BlockOfActions } from "~/components/features/actions";
import { ListOfActions } from "~/components/features/actions";

export function KanbanView({
  actions,
  list,
}: {
  actions: Action[];
  list: boolean;
}) {
  const matches = useMatches();
  const submit = useSubmit();
  const id = useId();

  const { states } = matches[1].data as DashboardRootType;

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const state = over?.id as string;
    const actionState = active.data.current?.state as string;
    const draggedAction = actions?.find((action) => action.id === active.id)!;

    if (state !== actionState) {
      submit(
        {
          ...draggedAction,
          state,
          intent: INTENTS.updateAction,
        },
        {
          action: "/handle-actions",
          method: "POST",
          navigate: false,
          fetcherKey: `action:${active.id}:update:move:kanban`,
        },
      );
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  return (
    <div className="pb-4">
      <div className="flex w-full">
        <DndContext onDragEnd={handleDragEnd} sensors={sensors} id={id}>
          {states.map((state) => {
            const stateActions = actions.filter(
              (action) => action.state === state.slug,
            );
            return (
              <KanbanColumn
                key={state.id}
                state={state}
                actions={stateActions}
                list={list}
              />
            );
          })}
        </DndContext>
      </div>
    </div>
  );
}

function KanbanColumn({
  state,
  actions,
  list,
}: {
  state: State;
  actions: Action[];
  list: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: state.slug });
  return (
    <div
      ref={setNodeRef}
      className={`relative z-0 flex max-h-[60vh] shrink-0 p-3 ${
        actions.length > 0 ? "min-w-72 grow" : "w-auto 2xl:min-w-72 2xl:grow"
      } flex-col border-t-4 ${isOver ? "dragover" : ""}`}
      style={{ borderColor: state.color }}
      key={state.slug}
    >
      <div className="via-background to-background absolute bottom-0 left-0 z-10 h-8 w-full bg-gradient-to-b from-transparent"></div>
      <div className="mb-2 flex items-center">
        <div
          className={`tracking-tigh flex items-center gap-2 rounded-full text-xl font-medium`}
        >
          {state.title}
        </div>
      </div>

      {list ? (
        <ListOfActions
          actions={actions}
          showCategory
          date={{ timeFormat: 1 }}
          scroll
        />
      ) : (
        <BlockOfActions max={1} actions={actions} sprint />
      )}
    </div>
  );
}
