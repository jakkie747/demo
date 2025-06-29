
'use client';

import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging, isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from './use-toast';

export const useFcmListener = () => {
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured() || !messaging || typeof window === 'undefined') {
      return;
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received.', payload);
      toast({
        title: payload.notification?.title || 'New Notification',
        description: payload.notification?.body || '',
      });
    });

    return () => {
      unsubscribe();
    };
  }, [toast]);
};
