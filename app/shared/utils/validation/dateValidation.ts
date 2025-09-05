import { addMinutes, isAfter, isBefore, parseISO, format, addHours } from "date-fns";
import { isInstagramFeed } from "./contentValidation";

export interface DateValidationResult {
  isValid: boolean;
  errors: string[];
  correctedDates?: {
    date?: string;
    instagram_date?: string;
  };
}

export interface DateValidationOptions {
  allowPastDates?: boolean;
  autoCorrect?: boolean;
  minTimeBetween?: number; // minutos mínimos entre realização e postagem
}

/**
 * Valida as datas de uma ação, garantindo que:
 * 1. A data do Instagram seja sempre após a data de realização
 * 2. Respeite o tempo mínimo necessário para realizar a ação
 * 3. Opcionalmente, não permita datas no passado
 */
export function validateActionDates(
  actionDate: Date | string,
  instagramDate: Date | string,
  timeRequired: number,
  category?: string,
  options: DateValidationOptions = {}
): DateValidationResult {
  const {
    allowPastDates = true,
    autoCorrect = false,
    minTimeBetween = 0
  } = options;

  const errors: string[] = [];
  let correctedDates: { date?: string; instagram_date?: string } = {};

  // Converter strings para Date se necessário
  const actionDateTime = typeof actionDate === 'string' ? parseISO(actionDate) : actionDate;
  const instagramDateTime = typeof instagramDate === 'string' ? parseISO(instagramDate) : instagramDate;
  const now = new Date();

  // Validar se as datas são válidas
  if (isNaN(actionDateTime.getTime())) {
    errors.push("Data de realização inválida");
    return { isValid: false, errors };
  }

  if (isNaN(instagramDateTime.getTime())) {
    errors.push("Data do Instagram inválida");
    return { isValid: false, errors };
  }

  // Validar datas no passado (se não permitido)
  if (!allowPastDates) {
    if (isBefore(actionDateTime, now)) {
      errors.push("A data de realização não pode ser no passado");
      if (autoCorrect) {
        correctedDates.date = format(now, "yyyy-MM-dd HH:mm:ss");
      }
    }

    if (isBefore(instagramDateTime, now)) {
      errors.push("A data do Instagram não pode ser no passado");
      if (autoCorrect) {
        correctedDates.instagram_date = format(now, "yyyy-MM-dd HH:mm:ss");
      }
    }
  }

  // Se for uma ação do Instagram, validar a sequência das datas
  if (category && isInstagramFeed(category, true)) {
    // A data do Instagram deve ser APÓS a data de realização
    if (isBefore(instagramDateTime, actionDateTime) || instagramDateTime.getTime() === actionDateTime.getTime()) {
      errors.push("A data de postagem no Instagram deve ser após a data de realização da ação");
      
      if (autoCorrect) {
        // Corrigir: Instagram = data de realização + tempo necessário (mínimo 1 minuto)
        const minInstagramDate = addMinutes(actionDateTime, Math.max(timeRequired, minTimeBetween, 1));
        correctedDates.instagram_date = format(minInstagramDate, "yyyy-MM-dd HH:mm:ss");
      }
    } else {
      // Verificar se há tempo suficiente entre realização e postagem
      const timeDifference = (instagramDateTime.getTime() - actionDateTime.getTime()) / (1000 * 60); // em minutos
      // O tempo necessário é o tempo da ação OU o minimo configurado, o que for MAIOR (mínimo 1 minuto)
      const requiredTime = Math.max(timeRequired, minTimeBetween, 1);
      
      if (timeDifference < requiredTime) {
        // Mostrar o tempo real necessário para esta ação específica
        const actualTimeNeeded = timeRequired;
        const timeText = actualTimeNeeded >= 60 ? 
          `${Math.floor(actualTimeNeeded / 60)}h${actualTimeNeeded % 60 > 0 ? `${actualTimeNeeded % 60}min` : ''}` :
          `${actualTimeNeeded} minutos`;
        
        errors.push(`A postagem no Instagram deve ser pelo menos ${timeText} após a realização da ação (tempo necessário para executá-la)`);
        
        if (autoCorrect) {
          const correctedInstagramDate = addMinutes(actionDateTime, requiredTime);
          correctedDates.instagram_date = format(correctedInstagramDate, "yyyy-MM-dd HH:mm:ss");
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    correctedDates: Object.keys(correctedDates).length > 0 ? correctedDates : undefined
  };
}

/**
 * Função auxiliar para corrigir automaticamente as datas de uma ação
 */
export function autoCorrectActionDates(
  actionDate: Date | string,
  instagramDate: Date | string,
  timeRequired: number,
  category?: string,
  options: DateValidationOptions = {}
): { date: string; instagram_date: string } {
  const actionDateTime = typeof actionDate === 'string' ? parseISO(actionDate) : actionDate;
  const instagramDateTime = typeof instagramDate === 'string' ? parseISO(instagramDate) : instagramDate;
  
  let correctedActionDate = actionDateTime;
  let correctedInstagramDate = instagramDateTime;
  
  // Se for ação do Instagram, garantir que a sequência seja correta
  if (category && isInstagramFeed(category, true)) {
    const timeDifference = (instagramDateTime.getTime() - actionDateTime.getTime()) / (1000 * 60); // em minutos
    const requiredMinutes = Math.max(timeRequired, options.minTimeBetween || 0, 1);
    
    // Se Instagram date está antes da action date OU se não há tempo suficiente entre elas
    if (isBefore(instagramDateTime, actionDateTime) || timeDifference < requiredMinutes) {
      // Manter a data de realização e ajustar a do Instagram para ter o tempo necessário
      correctedInstagramDate = addMinutes(correctedActionDate, requiredMinutes);
    }
  }
  
  return {
    date: format(correctedActionDate, "yyyy-MM-dd HH:mm:ss"),
    instagram_date: format(correctedInstagramDate, "yyyy-MM-dd HH:mm:ss")
  };
}

/**
 * Função para validar e sugerir correções de datas durante edição
 */
export function validateAndSuggestDates(
  currentAction: { date: string; instagram_date: string; time: number; category: string },
  newDate?: Date,
  newInstagramDate?: Date,
  isChangingActionDate = false
): {
  isValid: boolean;
  errors: string[];
  suggestions?: {
    action_date?: string;
    instagram_date?: string;
    message: string;
  };
} {
  const actionDate = newDate || parseISO(currentAction.date);
  const instagramDate = newInstagramDate || parseISO(currentAction.instagram_date);
  
  const validation = validateActionDates(
    actionDate,
    instagramDate,
    currentAction.time,
    currentAction.category,
    { autoCorrect: true, minTimeBetween: 0 }
  );
  
  if (!validation.isValid && validation.correctedDates) {
    let message = "";
    let suggestions: any = {};
    
    if (isChangingActionDate && validation.correctedDates.instagram_date) {
      message = `Como você alterou a data de realização, sugerimos ajustar a data do Instagram para ${format(parseISO(validation.correctedDates.instagram_date), "dd/MM 'às' HH:mm")}`;
      suggestions.instagram_date = validation.correctedDates.instagram_date;
    } else if (!isChangingActionDate && validation.correctedDates.date) {
      message = `Como a data do Instagram foi alterada, sugerimos ajustar a data de realização para ${format(parseISO(validation.correctedDates.date), "dd/MM 'às' HH:mm")}`;
      suggestions.action_date = validation.correctedDates.date;
    }
    
    return {
      isValid: false,
      errors: validation.errors,
      suggestions: {
        ...suggestions,
        message
      }
    };
  }
  
  return {
    isValid: validation.isValid,
    errors: validation.errors
  };
}