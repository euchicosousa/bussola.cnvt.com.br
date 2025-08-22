import { useEffect, useState } from "react";

export function useDocumentSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    if (window) {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
  }, []);

  return size;
}