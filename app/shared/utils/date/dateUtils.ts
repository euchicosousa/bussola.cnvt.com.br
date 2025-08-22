import {
  addHours,
  addMinutes,
  compareAsc,
  endOfDay,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isThisWeek,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
  startOfWeek,
  subHours,
} from "date-fns";
import { isInstagramFeed } from "../validation/contentValidation";

/**
 * Calcula novas datas para ações, considerando Instagram e datas relativas/absolutas
 */
export function getNewDateValues(
  action: Action,
  isInstagramDate?: boolean,
  minutes = 30,
  isRelativeFromNow = false,
  absoluteDate?: Date,
) {
  let values = {};
  let currentDate = isInstagramDate ? action.instagram_date : action.date;

  // determina a nova data
  // se vier uma data absoluta, usa-a
  // caso contrário, verifica se deve ser relativo ao agora
  // adiciona a quantidade de minutos na data base
  const newDate =
    absoluteDate ||
    addMinutes(isRelativeFromNow ? new Date() : currentDate, minutes);

  // Se for uma ação do instagram
  if (isInstagramFeed(action.category, true)) {
    // Se a data de fazer ação for depois da data de postagem
    // define uma nova data de postagem, sendo uma hora antes da data da ação
    if (isInstagramDate) {
      values = {
        date: isAfter(action.date, newDate)
          ? format(subHours(newDate, 1), "yyyy-MM-dd HH:mm:ss")
          : action.date,
        instagram_date: format(newDate, "yyyy-MM-dd HH:mm:ss"),
      };
    } else {
      values = {
        date: format(newDate, "yyyy-MM-dd HH:mm:ss"),
        instagram_date: isAfter(newDate, action.instagram_date)
          ? format(addHours(newDate, 1), "yyyy-MM-dd HH:mm:ss")
          : action.instagram_date,
      };
    }
  } else {
    values = {
      date: format(newDate, "yyyy-MM-dd HH:mm:ss"),
    };
  }

  return values;
}