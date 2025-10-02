import {
  format,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import {
  sortActions,
  isInstagramFeed,
  isSprint,
  getNewDateValues,
  getQueryString,
} from "~/lib/helpers";
import { getCategoryShortcuts, type ShortcutDefinition } from "./shortcuts";
import { INTENTS } from "~/lib/constants";
import { toggleSprint } from "~/shared";

/**
 * Merges actions with pending updates and handles deletions
 */
export function mergeActionsWithPending(
  actions: Action[] | null,
  pendingActions: Action[] = [],
  deletingIds: string[] = [],
): Action[] {
  if (!actions) return [];

  const actionsMap = new Map<string, Action>(
    actions.map((action) => [action.id, action]),
  );

  // Apply pending updates
  for (const action of pendingActions) {
    actionsMap.set(action.id, action);
  }

  // Remove deleted actions
  for (const id of deletingIds) {
    actionsMap.delete(id);
  }

  return sortActions(Array.from(actionsMap.values())) || [];
}

/**
 * Generates calendar data with actions for each day
 */
export function generateCalendarData(
  actions: Action[] | null,
  currentDate: Date,
  filters?: {
    categoryFilter?: Category[];
    stateFilter?: State;
    responsiblesFilter?: string[];
    isInstagramDate?: boolean;
  },
) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  return days.map((day) => {
    let filteredActions =
      actions?.filter((action) => {
        // Date comparison
        const actionDate =
          filters?.isInstagramDate && isInstagramFeed(action.category, true)
            ? parseISO(action.instagram_date)
            : parseISO(action.date);

        if (!isSameDay(actionDate, day)) {
          return false;
        }

        // Category filter
        if (filters?.categoryFilter && filters.categoryFilter.length > 0) {
          const hasCategory = filters.categoryFilter.find(
            (category) => category.slug === action.category,
          );
          if (!hasCategory) return false;
        }

        // State filter
        if (filters?.stateFilter && action.state !== filters.stateFilter.slug) {
          return false;
        }

        // Responsibles filter
        if (filters?.responsiblesFilter) {
          const hasResponsible = action.responsibles.find(
            (responsible: string) =>
              filters.responsiblesFilter?.find(
                (user_id) => user_id === responsible,
              ),
          );
          if (!hasResponsible) return false;
        }

        return true;
      }) || [];

    return {
      date: format(day, "yyyy-MM-dd"),
      actions: filteredActions,
    };
  });
}

/**
 * Groups actions by state for Kanban view
 */
export function groupActionsByState(actions: Action[], states: State[]) {
  const groupedActions = new Map<string, Action[]>();

  // Initialize groups
  states.forEach((state) => {
    groupedActions.set(state.slug, []);
  });

  // Group actions
  actions.forEach((action) => {
    const stateActions = groupedActions.get(action.state) || [];
    stateActions.push(action);
    groupedActions.set(action.state, stateActions);
  });

  return groupedActions;
}

/**
 * Filters actions based on search query
 */
export function filterActionsBySearch(
  actions: Action[],
  query: string,
): Action[] {
  if (!query || query.length < 2) return actions;

  const searchTerm = query.toLowerCase();

  return actions.filter(
    (action) =>
      action.title.toLowerCase().includes(searchTerm) ||
      action.description?.toLowerCase().includes(searchTerm) ||
      action.id.includes(searchTerm),
  );
}

// ===============================
// FUNÇÕES DE PROCESSAMENTO DE ATALHOS
// ===============================

/**
 * Processa ação de atalho de categoria (Alt + tecla)
 */
export function handleCategoryShortcut(
  key: string,
  action: Action,
  categories: Category[],
  handleActions: (data: any) => void,
): boolean {
  const categoryShortcuts = getCategoryShortcuts(categories);

  if (categoryShortcuts[key]) {
    handleActions({
      intent: INTENTS.updateAction,
      ...action,
      category: categoryShortcuts[key],
    });
    return true;
  }

  return false;
}

/**
 * Processa ação de atalho de estado (tecla simples)
 */
export function handleStateShortcut(
  key: string,
  action: Action,
  states: State[],
  handleActions: (data: any) => void,
): boolean {
  const state = states.find((state) => state.shortcut === key);

  if (state) {
    handleActions({
      intent: INTENTS.updateAction,
      ...action,
      state: state.slug,
    });
    return true;
  }

  return false;
}

/**
 * Processa ação de atalho de prioridade (tecla simples)
 */
export function handlePriorityShortcut(
  key: string,
  action: Action,
  priorities: Priority[],
  handleActions: (data: any) => void,
): boolean {
  const priority = priorities.find((priority) => priority.shortcut === key);

  if (priority) {
    handleActions({
      intent: INTENTS.updateAction,
      ...action,
      priority: priority.slug,
    });
    return true;
  }

  return false;
}

/**
 * Processa atalhos personalizados definidos no mapa
 */
export async function handleCustomShortcut(
  shortcut: ShortcutDefinition,
  action: Action,
  event: KeyboardEvent,
  context?: {
    navigate: any;
    handleActions: any;
    isInstagramDate: boolean;
    person: any;
    confirmDelete?: (callback: () => void) => void;
  },
) {
  if (!context) return;

  const { navigate, handleActions, isInstagramDate, person, confirmDelete } =
    context;
  const { key, modifiers } = shortcut;

  // Atalhos de ações principais
  if (modifiers.shift && key === "e") {
    navigate(
      `/dashboard/action/${action.id}/${action.partners[0]}${getQueryString()}`,
    );
  } else if (modifiers.shift && key === "d") {
    // Duplicação com novo ID gerado a cada execução
    handleActions({
      intent: INTENTS.duplicateAction,
      ...action,
      newId: window.crypto.randomUUID(),
      created_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
    });
  } else if (modifiers.shift && key === "x") {
    if (confirmDelete) {
      confirmDelete(() => {
        handleActions({
          ...action,
          intent: INTENTS.deleteAction,
        });
      });
    } else {
      // Fallback para o confirm nativo caso confirmDelete não esteja disponível
      if (confirm("Deseja mesmo excluir essa ação?")) {
        handleActions({
          ...action,
          intent: INTENTS.deleteAction,
        });
      }
    }
  } else if (modifiers.shift && key === "u") {
    handleActions({
      id: action.id,
      intent: INTENTS.updateAction,
      sprints: toggleSprint(action, person.user_id),
    });
  }

  // Atalhos de tempo relativo (Shift + tecla)
  else if (modifiers.shift && ["1", "2", "3"].includes(key)) {
    const hours = parseInt(key);
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, hours * 60),
    });
  } else if (modifiers.shift && key === "h") {
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, 30, true),
    });
  } else if (modifiers.shift && key === "a") {
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, 24 * 60, true),
    });
  } else if (modifiers.shift && key === "s") {
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, 7 * 24 * 60),
    });
  } else if (modifiers.shift && key === "m") {
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, 30 * 24 * 60),
    });
  }

  // Atalhos de tempo absoluto (Alt + número)
  else if (modifiers.alt && ["1", "2", "3"].includes(key)) {
    const hours = parseInt(key);
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, hours * 60, true),
    });
  }

  // Atalhos com Ctrl
  else if (modifiers.ctrl && key === "s") {
    handleActions({
      ...action,
      intent: INTENTS.updateAction,
      ...getNewDateValues(action, isInstagramDate, 7 * 24 * 60),
    });
  }
}
