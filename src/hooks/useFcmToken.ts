
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken } from 'firebase/messaging';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { messaging, db, isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from './use-toast';
import { useLanguage } from '@/context/LanguageContext';

// =================================================================
// =================================================================
//
//   ACTION REQUIRED: Please generate and add your VAPID key below.
//
//   1. Open Firebase Console: https://console.firebase.google.com/
//   2. Go to your project settings (click the ⚙️ icon).
//   3. Click the "Cloud Messaging" tab.
//   4. Under "Web configuration", click "Generate key pair".
//   5. Copy the key and paste it here, replacing the placeholder.
//
// =================================================================
// =================================================================
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

  const saveTokenToFirestore = useCallback(async (fcmToken: string) => {
    if (!db) return;
    try {
      const tokenDocRef = doc(db, 'fcmTokens', fcmToken);
      await setDoc(tokenDocRef, { createdAt: serverTimestamp() });
      console.log('FCM token saved successfully to Firestore.');
      toast({
        title: "Device Registered!",
        description: "This device can now receive push notifications.",
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
      toast({
        variant: 'destructive',
        title: 'Error Saving Token',
        description: (error as Error).message || t('couldNotSaveToken'),
      });
    }
  }, [t, toast]);

  const retrieveToken = useCallback(async () => {
    if (!isFirebaseConfigured() || !messaging) {
        console.error("Firebase Messaging is not configured.");
        return null;
    }
    if (VAPID_KEY === 'PASTE_YOUR_GENERATED_VAPID_KEY_HERE') {
        console.error("VAPID key is not set in src/hooks/useFcmToken.ts. Please follow the instructions in the file to generate and add your key.");
        toast({ variant: "destructive", title: "Configuration Error", description: "VAPID key for push notifications is not set. See console for details."});
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
      const fcmError = err as { code?: string };
      if (fcmError.code === 'messaging/token-subscribe-failed') {
        toast({
          variant: 'destructive',
          title: 'Browser Security Error',
          description: 'Could not get notification token. This is often caused by your browser blocking cookies or site data. Please check your browser settings for this site.',
          duration: 15000,
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('notificationError'),
          description: t('couldNotGetToken'),
        });
      }
      return null;
    }
  }, [saveTokenToFirestore, t, toast]);
  
  useEffect(() => {
    if (permission === 'granted') {
      retrieveToken();
    }
  }, [permission, retrieveToken]);

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
        // The useEffect above will now automatically handle retrieving the token.
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
