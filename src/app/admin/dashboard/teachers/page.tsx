
"use client";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, AlertTriangle, UserPlus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import type { Teacher } from "@/lib/types";
import { getTeachers, deleteTeacher } from "@/services/teacherService";
import { deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ManageTeachersPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const currentUser = auth?.currentUser;

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedTeachers = await getTeachers();
      setTeachers(fetchedTeachers);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch teachers." });
      setTeachers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchTeachers();
    } else {
      setIsLoading(false);
    }
  }, [fetchTeachers]);

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
  };

  const confirmDelete = async () => {
    if (teacherToDelete) {
      try {
        if (teacherToDelete.photo && teacherToDelete.photo.includes('firebasestorage')) {
          await deleteImageFromUrl(teacherToDelete.photo);
        }
        await deleteTeacher(teacherToDelete.id);
        await fetchTeachers();
        toast({
          title: t('teacherDeleted'),
          description: t('teacherDeletedDesc', { name: teacherToDelete.name }),
          variant: "destructive",
        });
      } catch (error) {
        const errorMessage = (error as Error).message;
        toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not delete teacher data." });
      } finally {
        setTeacherToDelete(null);
      }
    }
  };

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot manage teachers because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6">
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t('manageTeachers')}
        </h2>
        
         <Card className="mb-8">
            <CardHeader>
                <CardTitle>Important: How to Add New Teachers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Alert>
                    <UserPlus className="h-4 w-4" />
                    <AlertTitle>User management is handled in the Firebase Console.</AlertTitle>
                    <AlertDescription>
                        For security, new teachers must be added directly through the Firebase Authentication service. This page only displays teacher information stored in the database.
                    </AlertDescription>
                </Alert>
                <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                        Go to Firebase Console to Add Users
                    </Button>
                </a>
                <p className="text-sm text-muted-foreground">After adding a user in the console, their details will appear here once they log in for the first time.</p>
            </CardContent>
         </Card>

        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {t('existingTeachers')}
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('photo')}</TableHead>
                <TableHead>{t('teacherName')}</TableHead>
                <TableHead>{t('teacherEmail')}</TableHead>
                <TableHead>{t('role')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No teachers enrolled yet.
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                     <TableCell>
                        <Avatar>
                          <AvatarImage src={teacher.photo} alt={teacher.name} />
                          <AvatarFallback>
                            {teacher.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.email}</TableCell>
                    <TableCell><Badge variant={teacher.role === 'admin' ? 'default' : 'secondary'}>{teacher.role}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(teacher)}
                            disabled={teacher.id === currentUser?.uid}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        <AlertDialog
          open={!!teacherToDelete}
          onOpenChange={(open) => !open && setTeacherToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('deleteTeacherConfirmDesc', { name: teacherToDelete?.name || '' })} This will only remove their data from the app, not their ability to log in.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}
