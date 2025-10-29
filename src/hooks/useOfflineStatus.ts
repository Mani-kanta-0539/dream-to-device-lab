import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Connection restored.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Some features may be limited.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
};
