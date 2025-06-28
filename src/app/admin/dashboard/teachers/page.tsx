
"use client";
import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Edit, Trash2, AlertTriangle } from "lucide-react";
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
import { getTeachers, addTeacher, deleteTeacher } from "@/services/teacherService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { doc, updateDoc } from "firebase/firestore";

const teacherFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long.").optional(),
  photo: z.any().optional(),
});

export default function ManageTeachersPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const form = useForm<z.infer<typeof teacherFormSchema>>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      photo: undefined,
    },
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
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchTeachers();
    } else {
      setIsLoading(false);
    }
  }, [fetchTeachers]);


  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.reset({
      name: teacher.name,
      email: teacher.email,
      password: "",
      photo: undefined,
    });
  };

  const handleCancelClick = () => {
    setEditingTeacher(null);
    form.reset();
  };


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
        toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not delete teacher." });
      } finally {
        setTeacherToDelete(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof teacherFormSchema>) {
    setIsSaving(true);

    if (editingTeacher) {
      // UPDATE LOGIC
      try {
        let photoUrl = editingTeacher.photo;
        const file = values.photo?.[0];

        if (file) {
          const newPhotoUrl = await uploadImage(file, 'teachers');
          if (editingTeacher.photo && editingTeacher.photo.includes('firebasestorage')) {
            await deleteImageFromUrl(editingTeacher.photo);
          }
          photoUrl = newPhotoUrl;
        }

        const updatePayload = {
          name: values.name,
          email: values.email,
          photo: photoUrl,
        };

        if (!db) throw new Error("Firebase is not configured.");
        const teacherDocRef = doc(db, 'teachers', editingTeacher.id);
        await updateDoc(teacherDocRef, updatePayload);

        toast({
          title: t('teacherUpdated'),
          description: t('teacherUpdatedDesc', { name: values.name }),
        });
        
      } catch (error) {
        const errorMessage = (error as Error).message || "Could not update the teacher.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
        setIsSaving(false);
        return; // Stop execution on error
      }
    } else {
      // CREATE LOGIC
      try {
        if (!values.password) {
          form.setError("password", { type: "manual", message: "Password is required for new teachers." });
          setIsSaving(false);
          return;
        }

        const file = values.photo?.[0];
        let photoUrl = "https://placehold.co/100x100.png";

        if (file) {
          photoUrl = await uploadImage(file, 'teachers');
        }

        const newTeacher: Omit<Teacher, 'id'> = {
          name: values.name,
          email: values.email,
          password_insecure: values.password,
          role: 'teacher',
          photo: photoUrl,
        };
        await addTeacher(newTeacher);
        toast({
          title: t('teacherEnrolled'),
          description: t('teacherEnrolledDesc', { name: values.name }),
        });
      } catch (error) {
        const errorMessage = (error as Error).message || "Could not enroll new teacher.";
        toast({ variant: "destructive", title: "Error", description: errorMessage });
        setIsSaving(false);
        return; // Stop execution on error
      }
    }

    // This runs only on success for both create and update
    await fetchTeachers();
    setEditingTeacher(null);
    form.reset();
    setIsSaving(false);
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
    <div className="py-6 grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {editingTeacher ? t('editTeacher') : t('enrollNewTeacher')}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTeacher ? t('editingTeacher', { name: editingTeacher.name }) : t('teacherDetails')}
            </CardTitle>
            <CardDescription>
              {editingTeacher ? t('teacherUpdatedDesc', { name: ""}) : t('enrollNewTeacher')}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Warning</AlertTitle>
              <AlertDescription>
                This form is for prototyping only. It stores passwords in an insecure way. In a production environment, use a secure authentication provider like Firebase Authentication.
              </AlertDescription>
            </Alert>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('teacherName')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('egJohnSmith')}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('teacherEmail')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('egEmail')}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {!editingTeacher && (
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('temporaryPassword')}</FormLabel>
                        <FormControl>
                            <Input
                            type="password"
                            {...field}
                            disabled={isSaving}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 )}
                 {editingTeacher?.photo && (
                  <div className="space-y-2">
                    <FormLabel>{t('currentImage')}</FormLabel>
                    <Image
                      src={editingTeacher.photo}
                      alt={editingTeacher.name}
                      width={100}
                      height={100}
                      className="rounded-md object-cover border"
                    />
                  </div>
                )}
                 <FormField
                    control={form.control}
                    name="photo"
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                        <FormLabel>{editingTeacher ? t('replaceImage') : t('teacherPhoto')}</FormLabel>
                        <FormControl>
                            <Input
                            type="file"
                            accept="image/png, image/jpeg, image/gif, image/webp, image/avif"
                            onChange={(e) => onChange(e.target.files)}
                            onBlur={onBlur}
                            name={name}
                            ref={ref}
                            disabled={isSaving}
                            />
                        </FormControl>
                          <FormDescription>{t('teacherPhotoDesc')}</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="flex gap-2">
                    <Button type="submit" className="w-full" disabled={isSaving || !isConfigured}>
                        {isSaving ? "Saving..." : editingTeacher ? t('updateTeacher') : t('enrollTeacher')}
                    </Button>
                    {editingTeacher && (
                        <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={handleCancelClick}
                        disabled={isSaving}
                        >
                        {t('cancel')}
                        </Button>
                    )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div>
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
                          onClick={() => handleEditClick(teacher)}
                          disabled={teacher.role === 'admin'}
                         >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(teacher)}
                            disabled={teacher.role === 'admin'}
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
    </div>
  );
}
