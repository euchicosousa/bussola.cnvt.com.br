export function isSprint(action: Action, user_id: string) {
  return action.sprints
    ? action.sprints.find(
        (action_sprint_user_id) => action_sprint_user_id === user_id,
      )
    : false;
}

export function amIResponsible(responsibles: string[], user_id: string) {
  return responsibles.findIndex((id) => id === user_id) >= 0;
}

export function toggleSprint(action: Action, user_id: string): string[] {
  const sprints =
    action.sprints && isSprint(action, user_id)
      ? action.sprints.filter((user_id) => user_id !== user_id)
      : action.sprints?.length
        ? [...action.sprints, user_id]
        : [user_id];

  return sprints;
}
