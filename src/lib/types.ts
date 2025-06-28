
import type { TranslationKey } from "@/lib/translations";

export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  parent: string;
  parentEmail: string;
  parentPhone: string;
  photo: string;
  medicalConditions?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  previousPreschool: 'yes' | 'no';
  additionalNotes?: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  aiHint?: string;
  titleKey?: TranslationKey;
  descriptionKey?: TranslationKey;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  image: string;
  createdAt: any; // For Firestore timestamp
  updatedAt?: any; // For Firestore timestamp
  aiHint?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  // Storing passwords in plaintext is highly insecure. This is for prototype purposes only.
  // In a real application, use a secure authentication provider like Firebase Authentication.
  password_insecure: string; 
  role: 'admin' | 'teacher';
  photo?: string;
}
    
