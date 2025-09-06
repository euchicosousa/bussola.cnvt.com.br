// Sidebar mode management for dashboard
export enum SidebarMode {
  NONE = "none",
  FEED = "feed",
  EDITING = "editing",
}

/**
 * Determines the current sidebar mode based on URL search parameters
 * Priority: editing_action > show_feed > none (default)
 */
export function getSidebarMode(searchParams: URLSearchParams): SidebarMode {
  if (searchParams.get("editing_action")) return SidebarMode.EDITING;
  if (searchParams.get("show_feed")) return SidebarMode.FEED;
  return SidebarMode.NONE;
}

/**
 * Validates and cleans conflicting sidebar states
 * If both editing_action and show_feed exist, prioritizes editing_action
 */
export function validateSidebarState(
  searchParams: URLSearchParams,
): URLSearchParams {
  const hasEditing = !!searchParams.get("editing_action");
  const hasFeed = !!searchParams.get("show_feed");

  // If both states are active, prioritize editing and remove feed
  if (hasEditing && hasFeed) {
    const cleanParams = new URLSearchParams(searchParams);
    cleanParams.delete("show_feed");
    return cleanParams;
  }

  return searchParams;
}

/**
 * Creates clean URL params for switching to a specific sidebar mode
 */
export function setSidebarMode(
  currentParams: URLSearchParams,
  mode: SidebarMode,
  editingActionId?: string,
): URLSearchParams {
  const params = new URLSearchParams(currentParams);

  switch (mode) {
    case SidebarMode.FEED:
      params.delete("editing_action");
      params.set("show_feed", "true");
      params.set("instagram_date", "true");
      break;

    case SidebarMode.EDITING:
      params.delete("show_feed");
      if (editingActionId) {
        params.set("editing_action", editingActionId);
      }
      break;

    case SidebarMode.NONE:
    default:
      params.delete("editing_action");
      params.delete("show_feed");
      break;
  }

  return params;
}
