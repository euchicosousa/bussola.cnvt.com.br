import { format, formatDistanceToNow, isSameYear, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

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
}: {
  date: Date | string;
  dateFormat?: 0 | 1 | 2 | 3 | 4;
  timeFormat?: 0 | 1;
}) {
  date = typeof date === "string" ? parseISO(date) : date;
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

  return dateFormat === 1
    ? formatDistanceToNow(date, { locale: ptBR, addSuffix: true })
    : format(date, formatString, { locale: ptBR });
}