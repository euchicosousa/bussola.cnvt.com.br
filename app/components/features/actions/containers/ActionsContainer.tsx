import React, { useState } from "react";
import { useMatches } from "react-router";
import { ExpandIcon, ShrinkIcon } from "lucide-react";
import { Toggle } from "~/components/ui/toggle";
import { sortActions } from "~/lib/helpers";
import { ActionItem } from "../ActionItem";
import { ORDER_ACTIONS_BY, VARIANTS, type DateDisplay } from "~/lib/constants";

const FOLD_MULTIPLIER = 4;

interface ActionsContainerProps {
  actions?: Action[] | null;

  // Layout options
  variant?: typeof VARIANTS.LINE | typeof VARIANTS.BLOCK | typeof VARIANTS.HAIR;
  columns?: 1 | 2 | 3 | 4 | 5 | 6; // de 4 pra cima não tem sentido
  maxItems?: number; // Substitui o max={1|2} do BlockOfActions

  // Ordering options
  orderBy?: ORDER_ACTIONS_BY;
  descending?: boolean;

  // Display options
  showCategory?: boolean;
  showPartner?: boolean;
  showResponsibles?: boolean;
  showDelay?: boolean;
  dateDisplay?: DateDisplay;

  // Interaction options
  isScrollable?: boolean;
  isCollapsible?: boolean;
  showSprint?: boolean;

  // Selection (para dashboard.partner.tsx)
  selectMultiple?: boolean;
  selectedActions?: Action[];
  setSelectedActions?: React.Dispatch<React.SetStateAction<Action[]>>;
  handleEditingAction?: (actionId: string, actionPartnerSlug: string) => void;
  editingAction?: string | null;
}

export function ActionsContainer({
  actions,
  variant = VARIANTS.LINE,
  columns = 1,
  maxItems,
  orderBy = ORDER_ACTIONS_BY.state,
  descending = false,
  showCategory,
  showPartner,
  showResponsibles,
  showDelay,
  dateDisplay,
  isScrollable,
  isCollapsible,
  showSprint,
  selectMultiple,
  selectedActions,
  setSelectedActions,
  editingAction,
  handleEditingAction,
}: ActionsContainerProps): React.JSX.Element | null {
  const matches = useMatches();
  const { states } = matches[1].data as DashboardRootType;

  // Ordenação unificada
  actions = actions
    ? sortActions(actions, orderBy, descending ? "desc" : "asc", states) || []
    : [];

  // Limitação por maxItems
  const displayActions = maxItems ? actions?.slice(0, maxItems) : actions;

  const foldCount = columns * FOLD_MULTIPLIER;
  const [fold, setFold] = useState(isCollapsible ? foldCount : undefined);
  const finalActions = fold ? displayActions?.slice(0, fold) : displayActions;

  // CSS classes baseado no variant e configurações
  const getContainerClasses = () => {
    if (variant === VARIANTS.BLOCK || variant === VARIANTS.FINANCE) {
      if (maxItems === undefined) {
        return "grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))]";
      }
      return maxItems === 2 ? "grid grid-cols-2" : "flex flex-col";
    }

    if (variant === VARIANTS.HOUR) {
      return "flex";
    }

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
    variant === VARIANTS.FINANCE
      ? "gap-x-2 gap-y-8 pt-8"
      : variant === VARIANTS.HAIR
        ? "gap-y-[1px]"
        : variant === VARIANTS.BLOCK
          ? "gap-2"
          : variant === VARIANTS.HOUR
            ? "gap-0"
            : "gap-2";
  const paddingClass = variant === VARIANTS.BLOCK ? "p-1 pb-8" : "";
  const scrollClass = isScrollable
    ? "scrollbars-v pt-1 pb-8"
    : variant === VARIANTS.BLOCK
      ? "scrollbars-v"
      : "";

  if (!finalActions || finalActions.length === 0) {
    return null;
  }

  return (
    <div
      className={
        variant === VARIANTS.BLOCK
          ? "@container -mx-1 h-full overflow-hidden"
          : "group"
      }
    >
      <div
        className={` ${getContainerClasses()} ${scrollClass} ${gapClass} ${paddingClass} @container h-full`}
      >
        {finalActions.map((action, i) => (
          <ActionItem
            className={`${i === 0 ? "rounded-l-xs" : ""} ${
              i === finalActions.length - 1 ? "rounded-r-xs" : ""
            }`}
            key={action.id}
            action={action}
            variant={variant}
            showCategory={showCategory}
            showPartner={showPartner}
            showResponsibles={showResponsibles}
            showDelay={showDelay}
            dateDisplay={dateDisplay}
            sprint={showSprint}
            selectMultiple={selectMultiple}
            selectedActions={selectedActions}
            setSelectedActions={setSelectedActions}
            editingAction={editingAction}
            handleEditingAction={handleEditingAction}
          />
        ))}
      </div>

      {/* Fold toggle  */}
      {actions &&
      isCollapsible &&
      actions.length > foldCount &&
      variant !== VARIANTS.BLOCK ? (
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
