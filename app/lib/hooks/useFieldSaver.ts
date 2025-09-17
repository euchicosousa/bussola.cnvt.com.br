import { useCallback, useEffect, useMemo, useState } from "react";
import { useSubmit } from "react-router";
import { format } from "date-fns";
import { INTENTS } from "~/lib/constants";

// Função debounce simples
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

type EntityType = 'action' | 'partner' | 'person' | 'topic' | 'category' | 'state' | 'priority';

interface UseFieldSaverOptions<T> {
  entity: T;
  entityType: EntityType;
  intent?: string;
}

/**
 * Hook genérico para salvamento automático de campos
 * Usa o endpoint /handle-actions para todas as operações
 */
export function useFieldSaver<T extends Record<string, any>>({
  entity,
  entityType,
  intent,
}: UseFieldSaverOptions<T>) {
  const submit = useSubmit();
  
  // Intents padrão por tipo de entidade
  const defaultIntents: Record<EntityType, string> = {
    action: INTENTS.updateAction,
    partner: INTENTS.updatePartner,
    person: INTENTS.updatePerson,
    topic: INTENTS.updateTopic,
    category: INTENTS.updateCategory,
    state: INTENTS.updateState,
    priority: INTENTS.updatePriority,
  };

  const finalIntent = intent || defaultIntents[entityType];

  const saveField = useCallback((field: keyof T, value: any) => {
    const submitData = {
      ...entity,
      [field]: value,
      intent: finalIntent,
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
    };

    
    // Ensure arrays are converted to strings for FormData compatibility
    const formattedData = Object.fromEntries(
      Object.entries(submitData).map(([key, val]) => [
        key,
        Array.isArray(val) ? val.join(',') : val
      ])
    );
    
    submit(formattedData, { 
      action: "/handle-actions", 
      method: "post", 
      navigate: false 
    });
  }, [entity, finalIntent, submit]);

  const saveMultipleFields = useCallback((updates: Partial<T>) => {
    const submitData = {
      ...entity,
      ...updates,
      intent: finalIntent,
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
    };

    // Ensure arrays are converted to strings for FormData compatibility
    const formattedData = Object.fromEntries(
      Object.entries(submitData).map(([key, val]) => [
        key,
        Array.isArray(val) ? val.join(',') : val
      ])
    );

    submit(formattedData, { 
      action: "/handle-actions", 
      method: "post", 
      navigate: false 
    });
  }, [entity, finalIntent, submit]);

  return { 
    saveField, 
    saveMultipleFields 
  };
}

/**
 * Hook para campos com estado otimista e auto-save
 * Mantém estado local para evitar perda de cursor + salva em background
 */
export function useOptimisticField<T extends Record<string, any>>(
  entity: T,
  entityType: EntityType,
  field: keyof T,
  initialValue: any,
  delay: number = 1000
) {
  const [localValue, setLocalValue] = useState(initialValue);
  const { saveField } = useFieldSaver({ entity, entityType });
  
  // Sync com estado inicial quando entity muda (ex: navegação)
  useEffect(() => {
    setLocalValue(initialValue);
  }, [initialValue]);
  
  // Auto-save em background após período de inatividade
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== initialValue) {
        saveField(field, localValue);
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [localValue, initialValue, field, delay, saveField]);
  
  return [localValue, setLocalValue] as const;
}

/**
 * Hook unificado para auto-save
 * Simplifica a lógica de salvamento em qualquer campo
 */
export function useAutoSave<T extends Record<string, any>>(
  entity: T,
  setEntity: (updater: (prev: T) => T) => void,
  field: keyof T,
  delay: number = 3000
) {
  const { saveMultipleFields } = useFieldSaver({ entity, entityType: 'action' as EntityType });
  
  const save = useCallback((value: any) => {
    const updates = {
      [field]: value,
      updated_at: format(new Date(), "yyyy-MM-dd HH:mm:ss")
    } as unknown as Partial<T>;
    
    setEntity(prev => ({...prev, ...updates}));
    saveMultipleFields(updates);
  }, [field, saveMultipleFields, setEntity]);

  const debouncedSave = useMemo(() => 
    debounce(save, delay), 
    [save, delay]
  );
  
  return { save, debouncedSave };
}