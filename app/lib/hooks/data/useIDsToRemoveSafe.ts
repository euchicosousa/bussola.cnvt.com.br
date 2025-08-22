import { useState, useEffect } from 'react';
import { useIDsToRemove } from '~/lib/helpers';

export function useIDsToRemoveSafe() {
  const [isHydrated, setIsHydrated] = useState(false);
  const idsToRemove = useIDsToRemove();
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return {
    actions: isHydrated ? idsToRemove.actions : [],
    sprints: isHydrated ? idsToRemove.sprints : []
  };
}