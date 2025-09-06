import { addMinutes } from "date-fns";

/**
 * Função unificada de validação de datas para actions
 * Implementa a mesma lógica do CreateAction para manter consistência
 */
export function validateAndAdjustActionDates({
  date,
  instagram_date,
  time,
  currentDate,
  currentInstagramDate,
  currentTime
}: {
  date?: Date;
  instagram_date?: Date;
  time?: number;
  currentDate: Date;
  currentInstagramDate: Date;
  currentTime: number;
}) {
  let updates: any = {};
  
  const timeToUse = time ?? currentTime;
  
  if (date) {
    updates.date = date;
    
    // Verificar se instagram_date ainda respeitará a distância mínima
    const timeDiff = (currentInstagramDate.getTime() - date.getTime()) / (1000 * 60);
    
    if (timeDiff < timeToUse) {
      // Violou a regra → ajustar instagram_date
      updates.instagram_date = addMinutes(date, timeToUse);
    }
  } else if (instagram_date) {
    updates.instagram_date = instagram_date;
    
    // Verificar se date ainda respeitará a distância mínima  
    const timeDiff = (instagram_date.getTime() - currentDate.getTime()) / (1000 * 60);
    
    if (timeDiff < timeToUse) {
      // Violou a regra → ajustar date
      updates.date = addMinutes(instagram_date, -timeToUse);
    }
  } else if (time !== undefined) {
    // Só mudou categoria/time - MANTER INSTAGRAM_DATE INTACTO
    const currentTimeDiff = (currentInstagramDate.getTime() - currentDate.getTime()) / (1000 * 60);
    
    if (currentTimeDiff < time) {
      // Precisa ajustar DATE (não instagram_date)
      updates.date = addMinutes(currentInstagramDate, -time);
    }
    updates.time = time;
  }
  
  return updates;
}