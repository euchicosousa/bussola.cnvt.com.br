import { format, formatDistanceToNow, isSameYear, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DATE_FORMAT, TIME_FORMAT, type DateDisplay } from "~/lib/constants";

/**
 * Retorna a formatação da data e da hora de acordo com os parâmetros
 *  DATA
 *  0 - Sem informação de data
 *  1 - Distância
 *  2 - Curta
 *  3 - Média
 *  4 - Longa
 *
 * HORA
 *  0 - Sem informação de horas
 *  1 - Com horas
 * @param {string | Date} date - data em formato de string ou Date
 * @param {number | undefined} dateFormat - Formato da data de 0 a 4
 * @param {number | undefined} timeFormat - Fomrato da hora de 0 a 1
 * @returns {string} O texto explicativo para a IA usar
 * */
export function formatActionDatetime({
  date,
  dateFormat,
  timeFormat,
  prefix = "",
  suffix = "",
}: {
  date: Date | string;
  dateFormat?: DateDisplay["dateFormat"];
  timeFormat?: DateDisplay["timeFormat"];
  prefix?: string;
  suffix?: string;
}) {
  if (dateFormat === undefined && timeFormat === undefined) {
    dateFormat = DATE_FORMAT.FULL;
    timeFormat = TIME_FORMAT.WITH_TIME;
  }

  date = typeof date === "string" ? parseISO(date) : date;

  if (dateFormat === 1) {
    return `${prefix}${formatDistanceToNow(date, { locale: ptBR, addSuffix: true })}${suffix}`;
  }

  const formatString = (
    dateFormat === 2
      ? `d/M${
          !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
            ? "/yy"
            : ""
        }`
      : dateFormat === 3
        ? `d 'de' MMM${
            !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
              ? " 'de' yy"
              : ""
          }`
        : dateFormat === 4
          ? `E, d 'de' MMMM${
              !isSameYear(date.getFullYear(), new Date().getUTCFullYear())
                ? " 'de' yyy"
                : ""
            }`
          : ""
  ).concat(
    timeFormat
      ? `${dateFormat ? " 'às' " : ""}H'h'${date.getMinutes() > 0 ? "mm" : ""}`
      : "",
  );

  return `${prefix}${format(date, formatString, { locale: ptBR })}${suffix}`;
}
