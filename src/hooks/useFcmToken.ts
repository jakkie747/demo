'use client';

import { useState, useEffect } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { messaging, db, isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useLanguage } from '@/context/LanguageContext';

// =================================================================================
// CRITICAL: GENERATE YOUR VAPID KEY
// =================================================================================
// Push notifications will not work without a VAPID key.
//
// How to generate your key:
// 1. Go to your Firebase project settings:
//    https://console.firebase.google.com/project/blink-notify-494bf/settings/cloudmessaging
// 2. Under the "Web configuration" section, find "Web Push certificates".
// 3. Click "Generate key pair".
// 4. Copy the long string and paste it here, replacing the placeholder.
// =================================================================================
const VAPID_KEY = 'BOUJSqwdfKSQu3PW4owhcTLFDWINF9LyPofndBgV1J-E4_kJ1aviHYpyH0RSyOb7tH9RCN9p5yLopw5e0TmUYdE';

export const useFcmToken = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
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
    if (VAPID_KEY === 'PASTE_YOUR_VAPID_KEY_HERE') {
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
