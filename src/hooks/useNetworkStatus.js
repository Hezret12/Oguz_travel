import { useEffect, useState } from 'react';
import { subscribeNetworkStatus } from '../utils/networkStatusBus';

export function useNetworkStatus() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' && !navigator.onLine
  );

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    const unsubscribe = subscribeNetworkStatus({
      onError: handleOffline,
      onRecovered: handleOnline,
    });

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      unsubscribe();
    };
  }, []);

  return isOffline;
}
