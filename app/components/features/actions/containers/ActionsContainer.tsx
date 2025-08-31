import React, { useState } from "react";
import { useMatches } from "react-router";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
import {
  sortActions,
} from "~/lib/helpers";
import { ActionItem } from "../ActionItem";

const FOLD_MULTIPLIER = 4;

interface ActionsContainerProps {
  actions?: Action[] | null;

  // Layout options
  variant?: "line" | "block" | "hair";
  columns?: 1 | 2 | 3 | 6;
  max?: number; // Substitui o max={1|2} do BlockOfActions

  // Ordering options
  orderBy?: "state" | "priority" | "time";
  descending?: boolean;

  // Display options
  showCategory?: boolean;
  showPartner?: boolean;
  showResponsibles?: boolean;
  showDelay?: boolean;
  date?: { dateFormat?: 0 | 1 | 2 | 3 | 4; timeFormat?: 0 | 1 };
  long?: boolean;

  // Interaction options
  scroll?: boolean;
  isFoldable?: boolean;
  sprint?: boolean;

  // Selection (para dashboard.partner.tsx)
  selectMultiple?: boolean;
  selectedActions?: Action[];
  setSelectedActions?: React.Dispatch<React.SetStateAction<Action[]>>;
  editingAction?: string | null;
  setEditingAction?: React.Dispatch<React.SetStateAction<string | null>>;
}

export function ActionsContainer({
  actions,
  variant = "line",
  columns = 1,
  max,
  orderBy = "state",
  descending = false,
  showCategory,
  showPartner,
  showResponsibles,
  showDelay,
  date,
  long,
  scroll,
  isFoldable,
  sprint,
  selectMultiple,
  selectedActions,
  setSelectedActions,
  editingAction,
  setEditingAction,
}: ActionsContainerProps) {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;

  // Ordenação unificada
  actions = actions
    ? sortActions(actions, orderBy as any, descending ? "desc" : "asc", states) || []
    : [];

  // Limitação por max (funcionalidade do BlockOfActions)
  const displayActions = max ? actions?.slice(0, max) : actions;

  // Fold logic (funcionalidade do ListOfActions)
  const foldCount = columns * FOLD_MULTIPLIER;
  const [fold, setFold] = useState(isFoldable ? foldCount : undefined);
  const finalActions = fold ? displayActions?.slice(0, fold) : displayActions;

  // CSS classes baseado no variant e configurações
  const getContainerClasses = () => {
    if (variant === "block") {
      // Layout do antigo BlockOfActions
      if (max === undefined) {
        return "grid @[600px]:grid-cols-2 @[1000px]:grid-cols-3 @[1300px]:grid-cols-4";
      }
      return max === 2 ? "grid grid-cols-2" : "flex flex-col";
    }

    // Layout do antigo ListOfActions
    if (columns === 1) {
      return "flex flex-col";
    }
    return columns === 2
      ? "grid sm:grid-cols-2"
      : columns === 3
        ? "grid sm:grid-cols-2 md:grid-cols-3"
        : "grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6";
  };

  const gapClass =
    variant === "hair"
      ? "gap-y-[1px]"
      : variant === "block"
        ? "gap-2"
        : "gap-y-1";
  const paddingClass = variant === "block" ? "p-1 pb-8" : "";
  const scrollClass = scroll
    ? "scrollbars-v pt-1 pb-8"
    : variant === "block"
      ? "scrollbars-v"
      : "";

  if (!finalActions || finalActions.length === 0) {
    return null;
  }

  return (
    <div
      className={
        variant === "block"
          ? "@container -mx-1 h-full overflow-hidden"
          : "group"
      }
    >
      <div
        className={` ${getContainerClasses()} ${scrollClass} ${gapClass} ${paddingClass} @container h-full gap-x-4`}
      >
        {finalActions.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            variant={variant}
            long={long}
            showCategory={showCategory}
            showPartner={showPartner}
            showResponsibles={showResponsibles}
            showDelay={showDelay}
            date={date}
            sprint={sprint}
            selectMultiple={selectMultiple}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
            editingAction={editingAction}
            setEditingAction={setEditingAction}
          />
        ))}
      </div>

      {/* Fold toggle (apenas para ListOfActions behavior) */}
      {actions &&
      isFoldable &&
      actions.length > foldCount &&
      variant !== "block" ? (
        <div className="p-4 text-center opacity-0 group-hover:opacity-100">
          <Toggle
            size="sm"
            pressed={fold === undefined}
            onPressedChange={(pressed) => {
              setFold(pressed ? undefined : foldCount);
            }}
          >
            {fold === undefined ? (
              <>
                <ShrinkIcon className="size-3" />
              </>
            ) : (
              <>
                <ExpandIcon className="size-3" />
              </>
            )}
          </Toggle>
        </div>
      ) : null}
    </div>
  );
}

// Aliases para backward compatibility
export const ListOfActions = (props: any) => <ActionsContainer {...props} />;
export const BlockOfActions = (props: any) => (
  <ActionsContainer {...props} variant="block" />
);
