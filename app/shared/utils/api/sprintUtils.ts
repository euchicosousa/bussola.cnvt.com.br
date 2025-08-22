export function isSprint(action_id: string, sprints: Sprint[]) {
  return sprints
    ? sprints.filter((s) => s.action_id === action_id).length > 0
    : false;
}

export function amIResponsible(responsibles: string[], user_id: string) {
  return responsibles.findIndex((id) => id === user_id) >= 0;
}