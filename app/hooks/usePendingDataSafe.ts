import { useState, useEffect } from 'react';
import { usePendingData } from '~/lib/helpers';

export function usePendingDataSafe() {
  const [isHydrated, setIsHydrated] = useState(false);
  const pendingData = usePendingData();
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return {
    actions: isHydrated ? pendingData.actions : [],
    sprints: isHydrated ? pendingData.sprints : []
  };
}