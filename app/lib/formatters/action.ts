import { format, parseISO } from "date-fns";

export function actionToRawAction(action: Action): RawAction {
  return {
    title: action.title,
    description: action.description,
    category: action.category,
    state: action.state,
    date: parseISO(action.date),
    instagram_date: parseISO(action.instagram_date),
    user_id: action.user_id,
    responsibles: action.responsibles,
    color: action.color,
    time: action.time,
    partners: action.partners,
    topics: action.topics,
  };
}

export function getBiaMessage(message: string) {
  return `${message}`;
  // return `<hr>${message}<h5>βia às ${format(new Date(), "HH:mm:ss")}</h5>`;
}
