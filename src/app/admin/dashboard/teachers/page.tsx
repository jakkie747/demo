
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
import { Trash2, AlertTriangle, UserPlus, Edit } from "lucide-react";
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
import { getTeachers, updateTeacher } from "@/services/teacherService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { auth, isFirebaseConfigured, firebaseConfig, functions } from "@/lib/firebase";
import { httpsCallable } from "firebase/functions";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";

const teacherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  contactNumber: z.string().optional(),
  homeAddress: z.string().optional(),
  photo: z.any().optional(),
});

export default function ManageTeachersPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured] = useState(isFirebaseConfigured());
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);
  const currentUser = auth?.currentUser;

  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
  });

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
    if (isConfigured) {
      fetchTeachers();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchTeachers]);

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.reset({
      name: teacher.name,
      contactNumber: teacher.contactNumber || "",
      homeAddress: teacher.homeAddress || "",
      photo: undefined,
    });
    setSubmissionError(null);
    setIsDialogOpen(true);
  };

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

  const onEditSubmit = async (values: z.infer<typeof teacherFormSchema>) => {
    if (!editingTeacher) return;
    setSubmissionError(null);
    setIsSaving(true);
    try {
      let photoUrl = editingTeacher.photo;
      const file = values.photo?.[0];

      if (file) {
        photoUrl = await uploadImage(file, 'teachers');
        if (editingTeacher.photo && editingTeacher.photo.includes('firebasestorage')) {
          await deleteImageFromUrl(editingTeacher.photo);
        }
      }

      const updatedData: Partial<Teacher> = {
        name: values.name,
        contactNumber: values.contactNumber,
        homeAddress: values.homeAddress,
        photo: photoUrl,
      };

      await updateTeacher(editingTeacher.id, updatedData);
      await fetchTeachers();
      toast({ title: t('teacherUpdated'), description: t('teacherUpdatedDesc', { name: values.name }) });
      setIsDialogOpen(false);
      setEditingTeacher(null);

    } catch (error) {
       const errorMessage = (error as Error).message;
       let errorTitle = "Error updating teacher.";
       if (errorMessage.includes("timed out") || errorMessage.includes("storage/object-not-found")) {
          errorTitle = "Update Failed: Firebase Storage Not Ready";
          setSubmissionError({
            title: errorTitle,
            description: "There was a problem uploading the photo. Please check the troubleshooting steps on the Manage Events or Gallery pages."
          });
        } else {
           setSubmissionError({ title: errorTitle, description: errorMessage });
        }
    } finally {
      setIsSaving(false);
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
              <TableHead>{t('contactNumber')}</TableHead>
              <TableHead>{t('homeAddress')}</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                </TableRow>
              ))
            ) : teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
                  <TableCell>{teacher.contactNumber || '-'}</TableCell>
                  <TableCell>{teacher.homeAddress || '-'}</TableCell>
                  <TableCell><Badge variant={teacher.role === 'admin' ? 'default' : 'secondary'}>{teacher.role}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(teacher)}
                      >
                        <Edit className="h-4 w-4" />
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
      </Card>
      
      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if(!open) { setIsDialogOpen(false); setSubmissionError(null); }}}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('editTeacherProfile')}</DialogTitle>
            <DialogDescription>
              {t('updateTeacherProfileDesc')}
            </DialogDescription>
          </DialogHeader>
          {editingTeacher && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
                 <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('teacherName')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contactNumber')}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="homeAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('homeAddress')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editingTeacher.photo && (
                  <div className="space-y-2">
                    <Label>{t('currentImage')}</Label>
                    <Image
                      src={editingTeacher.photo}
                      alt={editingTeacher.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover border"
                    />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="photo"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel>{t('teacherPhoto')}</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files)}
                          disabled={isSaving}
                        />
                      </FormControl>
                       <FormDescription>
                        {editingTeacher.photo ? t('replaceImage') : t('uploadImage')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {submissionError && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{submissionError.title}</AlertTitle>
                        <AlertDescription>
                        {submissionError.description}
                        </AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                    {t('cancel')}
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : t('saveChanges')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>


      {/* Delete Teacher Alert Dialog */}
      <AlertDialog
        open={!!teacherToDelete}
        onOpenChange={(open) => !open && setTeacherToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteTeacherConfirmDesc', { name: teacherToDelete?.name || '' })}
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
