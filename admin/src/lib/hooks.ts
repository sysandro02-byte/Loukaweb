import { useState } from 'react';

export function useNotice() {
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotice = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3200);
  };

  return { notice, showNotice };
}
