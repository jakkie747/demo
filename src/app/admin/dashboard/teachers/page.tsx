
"use client";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
import { Trash2, AlertTriangle, UserPlus, Edit, Ban } from "lucide-react";
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
import { getTeachers } from "@/services/teacherService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured, firebaseConfig, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function ManageTeachersPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());

  const { teacher, user, loading: authLoading } = useAdminAuth();
  const isAuthorized = teacher?.role === 'admin';
  const currentUser = user;

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
    if (authLoading) return;

    if (isConfigured && isAuthorized) {
      fetchTeachers();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchTeachers, isAuthorized, authLoading]);

  const handleDeleteClick = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
  };

  const confirmDelete = async () => {
    if (!teacherToDelete || !functions) return;

    try {
      const deleteTeacherUser = httpsCallable(functions, 'deleteTeacherUser');
      await deleteTeacherUser({ uid: teacherToDelete.id });
      
      await fetchTeachers();
      toast({
        title: t('teacherDeleted'),
        description: t('teacherDeletedAndAuthDesc', { name: teacherToDelete.name }),
        variant: "destructive",
      });
    } catch (error: any) {
      let errorMessage = "Could not delete teacher.";
      if (error.code === 'functions/permission-denied') {
          errorMessage = "Permission denied. You cannot delete this user.";
      } else if (error.message) {
          errorMessage = error.message;
      }
      
      toast({ 
          variant: "destructive", 
          title: "Error", 
          description: errorMessage
      });
      console.error("Error deleting teacher:", error);
    } finally {
      setTeacherToDelete(null);
    }
  };

  if (authLoading) {
    return (
      <div className="py-6 space-y-4">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="py-12 flex justify-center">
        <Alert variant="destructive" className="max-w-lg">
          <Ban className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page. This feature is restricted to administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
    <div className="py-6 space-y-6">
      <div>
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
                        For security, new teachers must be added directly through the Firebase Authentication service. This page only displays and allows editing of teacher information stored in the database.
                    </AlertDescription>
                </Alert>
                <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                        Go to Firebase Console to Add Users
                    </Button>
                </a>
                <p className="text-sm text-muted-foreground">After adding a user in the console, their details will appear here once they log in for the first time. You can then edit their profile to add more details.</p>
            </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">
          {t('existingTeachers')}
        </h2>
        <div className="w-full overflow-x-auto">
            <Card>
                <CardContent className="p-0">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('teacherName')}</TableHead>
                        <TableHead className="hidden sm:table-cell">{t('teacherEmail')}</TableHead>
                        <TableHead>{t('role')}</TableHead>
                        <TableHead className="text-right">{t('actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20 inline-block" /></TableCell>
                        </TableRow>
                    ))
                    ) : teachers.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                        No teachers enrolled yet.
                        </TableCell>
                    </TableRow>
                    ) : (
                    teachers.map((teacher) => (
                        <TableRow key={teacher.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={teacher.photo} alt={teacher.name} />
                                        <AvatarFallback>{teacher.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="font-medium">{teacher.name}</div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{teacher.email}</TableCell>
                            <TableCell>
                                <Badge variant={teacher.role === 'admin' ? 'default' : 'secondary'}>{teacher.role}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                                <Button asChild variant="ghost" size="icon">
                                    <Link href={`/admin/dashboard/teachers/${teacher.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                </Button>
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
                </CardContent>
            </Card>
        </div>
      </div>
      
      <AlertDialog
        open={!!teacherToDelete}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
