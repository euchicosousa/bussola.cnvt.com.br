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

export function sortActions(
  actions?: Action[] | null,
  order: "asc" | "desc" = "asc",
) {
  return actions
    ? actions
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .sort((a, b) =>
          order === "desc"
            ? Number(b.state) - Number(a.state)
            : Number(a.state) - Number(b.state),
        )
    : null;
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

export function getActionsByPriority(actions: Action[], descending?: boolean) {
  let _sorted: Action[][] = [];

  const PRIORITIES = { low: "low", mid: "mid", high: "high" };
  Object.entries(PRIORITIES).map(([, value]) => {
    _sorted.push(actions.filter((action) => action.priority === value));
  });

  return descending ? _sorted.reverse().flat() : _sorted.flat();
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

export function getActionsByTime(actions: Action[], descending?: boolean) {
  let _sorted = actions.sort((a, b) => (isBefore(a.date, b.date) ? -1 : 1));

  return descending ? _sorted.reverse() : _sorted;
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

// Helper function that needs to be defined or imported
function isInstagramFeed(category: string, stories?: boolean): boolean {
  const instagramCategories = ["post", "carousel", "reels"];
  const storiesCategories = ["stories"];

  if (stories) {
    return storiesCategories.includes(category);
  }

  return instagramCategories.includes(category);
}
