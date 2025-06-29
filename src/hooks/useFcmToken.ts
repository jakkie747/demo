'use client';

import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { messaging, db, isFirebaseConfigured, firebaseConfig } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useLanguage } from '@/context/LanguageContext';

const VAPID_KEY = 'BOUJSqwdfKSQu3PW4owhcTLFDWINF9LyPofndBgV1J-E4_kJ1aviHYpyH0RSyOb7tH9RCN9p5yLopw5e0TmUYdE';

export const useFcmToken = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // This effect uses the modern Permissions API to get and watch the notification permission state.
    if (typeof window !== 'undefined' && navigator.permissions) {
      const handlePermissionChange = (status: PermissionStatus) => {
        setPermission(status.state);
      };

      navigator.permissions.query({ name: 'notifications' }).then((status) => {
        setPermission(status.state);
        status.onchange = () => handlePermissionChange(status);
      });

      // Cleanup function to remove the event listener
      return () => {
        navigator.permissions.query({ name: 'notifications' }).then((status) => {
          status.onchange = null;
        });
      };
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      // Fallback for older browsers that don't support navigator.permissions
      setPermission(Notification.permission);
    }
  }, []);

  const saveTokenToFirestore = async (fcmToken: string) => {
    if (!db) return;
    try {
      const tokenDocRef = doc(db, 'fcmTokens', fcmToken);
      await setDoc(tokenDocRef, { createdAt: serverTimestamp() });
      console.log('FCM token saved to Firestore.');
    } catch (error) {
      console.error('Error saving FCM token:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: t('couldNotSaveToken'),
      });
    }
  };

  const retrieveToken = async () => {
    if (!isFirebaseConfigured() || !messaging) {
        console.error("Firebase Messaging is not configured.");
        return null;
    }
    if (VAPID_KEY.length < 50) {
        console.error("VAPID key is not set in src/hooks/useFcmToken.ts");
        toast({ variant: "destructive", title: "Configuration Error", description: "VAPID key for push notifications is not set."});
        return null;
    }

    try {
      const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (currentToken) {
        setToken(currentToken);
        await saveTokenToFirestore(currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (err) {
      console.error('An error occurred while retrieving token.', err);
      toast({
        variant: 'destructive',
        title: t('notificationError'),
        description: t('couldNotGetToken'),
      });
      return null;
    }
  };

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        toast({ title: t('notificationsNotSupported') });
        return;
    }
    
    setIsRequesting(true);
    try {
      const status = await Notification.requestPermission();
      // The useEffect with navigator.permissions.query will handle the state update automatically,
      // but we can set it here for immediate feedback if needed.
      setPermission(status);

      if (status === 'granted') {
        toast({ title: t('notificationsEnabled'), description: t('youWillReceiveUpdates') });
        await retrieveToken();
      } else {
        toast({ variant: 'destructive', title: t('notificationsDenied'), description: t('youCanEnableLater') });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({ variant: 'destructive', title: 'Error', description: t('couldNotRequestPermission') });
    } finally {
      setIsRequesting(false);
    }
  };

  return { token, permission, requestPermission, isRequesting };
};
