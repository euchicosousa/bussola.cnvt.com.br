import {
  parseISO,
  isAfter,
  isBefore,
  isSameDay,
  compareAsc,
  isToday,
  isTomorrow,
  isThisWeek,
  isSameMonth,
} from "date-fns";
import { isInstagramFeed } from "~/shared/utils/validation/contentValidation";

export function sortActions(
  actions?: Action[] | null,
  orderActionsBy: ORDER_ACTIONS_BY = "date",
  order: "asc" | "desc" = "asc",
  states?: State[],
  useInstagramDate?: boolean,
) {
  if (!actions) return null;

  // console.log("orderActionsBy", orderActionsBy);
  // console.log("order", order);

  switch (orderActionsBy) {
    case "state":
      if (!states) {
        console.log("Você não mandou states");
        return actions;
      }
      let sortedStates = order === "desc" ? [...states].reverse() : states;
      let _sorted: Action[][] = [];
      sortedStates.forEach((state) => {
        _sorted.push(actions.filter((action) => action.state === state.slug));
      });

      return _sorted.flat();

    case "priority":
      const PRIORITIES = { low: "low", mid: "mid", high: "high" };
      let sortedPriorities =
        order === "desc"
          ? Object.values(PRIORITIES).reverse()
          : Object.values(PRIORITIES);
      let _sortedByPriority: Action[][] = [];
      sortedPriorities.forEach((priority) => {
        _sortedByPriority.push(
          actions.filter((action) => action.priority === priority),
        );
      });

      return _sortedByPriority.flat();

    case "date":
      return actions.sort((a, b) => {
        // Determine which date to use for each action
        const aDate = useInstagramDate && isInstagramFeed(a.category, true) 
          ? a.instagram_date 
          : a.date;
        const bDate = useInstagramDate && isInstagramFeed(b.category, true) 
          ? b.instagram_date 
          : b.date;
        
        const comparison = isBefore(parseISO(aDate), parseISO(bDate))
          ? -1
          : 1;
        return order === "desc" ? -comparison : comparison;
      });

    case "title":
      return actions.sort((a, b) => {
        const comparison = a.title.localeCompare(b.title, "pt-BR");
        return order === "desc" ? -comparison : comparison;
      });

    default:
      return actions;
  }
}

export function getDelayedActions({
  actions,
  priority,
}: {
  actions?: Action[] | null;
  priority?: "low" | "mid" | "high" | null;
}) {
  return actions
    ? actions.filter(
        (action) =>
          (priority ? action.priority === priority : true) &&
          isAfter(new Date(), parseISO(action.date)) &&
          action.state !== "finished" &&
          action.state !== "archived",
      )
    : [];
}

export function getNotFinishedActions({
  actions,
}: {
  actions?: Action[] | null;
}) {
  return actions
    ? actions.filter(
        (action) =>
          isAfter(parseISO(action.date), new Date()) &&
          action.state !== "finished",
      )
    : [];
}

export function getUrgentActions(actions: Action[] | null) {
  return actions
    ? actions.filter(
        (action) => action.priority === "high" && action.state !== "finished",
      )
    : [];
}

export function getActionsByState(
  actions: Action[],
  states: State[],
  descending?: boolean,
) {
  let _sorted: Action[][] = [];
  Object.entries(states).map(([, value]) => {
    _sorted.push(actions.filter((action) => action.state === value.slug));
  });

  return descending ? _sorted.reverse().flat() : _sorted.flat();
}

export function getActionsForThisDay({
  actions,
  date,
  isInstagramDate,
}: {
  actions?: Action[] | null;
  date?: Date | null;
  isInstagramDate?: boolean;
}) {
  const currentDate = date || new Date();

  return actions
    ? actions.filter((action) =>
        isSameDay(
          parseISO(isInstagramDate ? action.instagram_date : action.date),
          currentDate,
        ),
      )
    : [];
}

export function getInstagramFeed({
  actions,
  stories,
}: {
  actions?: Action[] | RawAction[] | null;
  stories?: boolean;
}): Action[] {
  return actions
    ? (actions
        .filter((action) => isInstagramFeed(action.category, stories))
        .sort((a, b) =>
          compareAsc(b.instagram_date, a.instagram_date),
        ) as Action[])
    : [];
}

export function getTodayActions(actions: Action[]) {
  return actions?.filter((action) => isToday(action.date)) as Action[];
}

export function getTomorrowActions(actions: Action[]) {
  return actions?.filter((action) => isTomorrow(action.date)) as Action[];
}

export function getThisWeekActions(actions: Action[]) {
  return actions?.filter((action) => isThisWeek(action.date)) as Action[];
}

export function getMonthsActions(actions: Action[], date = new Date()) {
  return actions?.filter((action) =>
    isSameMonth(action.date, date),
  ) as Action[];
}

