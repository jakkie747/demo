"use client";
import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
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
import { Textarea } from "@/components/ui/textarea";
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
import type { Activity } from "@/lib/types";
import { getActivities, addActivity, updateActivity, deleteActivity } from "@/services/activityService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured } from "@/lib/firebase";

const activityFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  image: z.any().optional(),
});

export default function ManageActivitiesPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  const form = useForm<z.infer<typeof activityFormSchema>>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: undefined,
    },
  });

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedActivities = await getActivities();
      setActivities(fetchedActivities);
    } catch (error: any) {
      let title = "Error Loading Activities";
      let description = error.message || "An unexpected error occurred while fetching activities.";

      if (error.message.includes("firestore/failed-precondition")) {
        title = "Database Index Required";
        description = "A database index is required. Please open the browser console (F12) to find a link to create the required Firestore index, then refresh the page.";
        console.error("Firebase Error: The following error message contains a link to create the required Firestore index. Please click the link to resolve the issue:", error);
      }

      toast({
        variant: "destructive",
        title: title,
        description: description,
        duration: 15000,
      });
      setActivities([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchActivities();
    } else {
      setIsLoading(false);
    }
  }, [fetchActivities]);

  const handleEditClick = (activity: Activity) => {
    setEditingActivity(activity);
    form.reset({
      title: activity.title,
      description: activity.description,
      image: undefined,
    });
  };

  const handleCancelClick = () => {
    setEditingActivity(null);
    form.reset();
  };

  const handleDeleteClick = (activity: Activity) => {
    setActivityToDelete(activity);
  };

  const confirmDelete = async () => {
    if (activityToDelete) {
      try {
        if (activityToDelete.image) {
          await deleteImageFromUrl(activityToDelete.image);
        }
        await deleteActivity(activityToDelete.id);
        await fetchActivities();
        toast({
          title: t('activityDeleted'),
          description: t('activityDeletedDesc', { title: activityToDelete.title }),
          variant: "destructive",
        });
      } catch (error) {
        const errorMessage = (error as Error).message;
        toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not delete activity." });
      } finally {
        setActivityToDelete(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof activityFormSchema>) {
    setIsSaving(true);
    const file = values.image?.[0];
    let imageUrl: string | undefined = editingActivity?.image;

    try {
      console.log("Submission started.");
      if (file) {
        console.log("Uploading image...");
        const newImageUrl = await uploadImage(file, 'activities');
        console.log("Image uploaded successfully:", newImageUrl);
        if (editingActivity?.image) {
          console.log("Deleting old image...");
          await deleteImageFromUrl(editingActivity.image);
          console.log("Old image deleted.");
        }
        imageUrl = newImageUrl;
      }

      const activityPayload = {
        title: values.title,
        description: values.description,
        image: imageUrl || "https://placehold.co/400x300.png",
      };

      if (editingActivity) {
        console.log("Updating activity...");
        await updateActivity(editingActivity.id, activityPayload);
        console.log("Activity updated.");
        toast({
          title: t('activityUpdated'),
          description: t('activityUpdatedDesc', { title: values.title }),
        });
      } else {
        console.log("Adding new activity...");
        const newActivity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'> = {
          ...activityPayload
        };
        await addActivity(newActivity);
        console.log("New activity added.");
        toast({
          title: t('activityCreated'),
          description: t('activityCreatedDesc', { title: values.title }),
        });
      }
      console.log("Fetching updated activities...");
      await fetchActivities();
      console.log("Activities fetched.");
      setEditingActivity(null);
      form.reset();
    } catch (error) {
      console.error("Failed to save activity:", error);
      const errorMessage = (error as Error).message;
      toast({ variant: "destructive", title: "Error Saving Activity", description: errorMessage || "Could not save the activity. Check the console for more details." });
    } finally {
      console.log("Submission finished.");
      setIsSaving(false);
    }
  }

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot manage activities because the application is not connected to Firebase.</p>
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
          {editingActivity ? t('editingActivity', { title: editingActivity.title }) : t('createNewActivityTitle')}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingActivity
                ? t('editingActivity', { title: editingActivity.title })
                : t('activityDetails')}
            </CardTitle>
            <CardDescription>
              {editingActivity
                ? t('updateActivityDetails')
                : t('createActivityDetails')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('activityTitle')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('egArtDay')}
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
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('describeActivity')}
                          {...field}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {editingActivity?.image && (
                  <div className="space-y-2">
                    <FormLabel>{t('currentImage')}</FormLabel>
                    <Image
                      src={editingActivity.image}
                      alt={editingActivity.title}
                      width={100}
                      height={100}
                      className="rounded-md object-cover border"
                    />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel>{t('activityImage')}</FormLabel>
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
                      <FormDescription>
                        {editingActivity
                          ? t('replaceImage')
                          : t('uploadImage')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? "Saving..." : editingActivity ? t('updateActivity') : t('createActivity')}
                  </Button>
                  {editingActivity && (
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
          {t('existingActivities')}
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('title')}</TableHead>
                <TableHead>{t('description')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : activities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No activities created yet.
                  </TableCell>
                </TableRow>
              ) : (
                activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.title}</TableCell>
                    <TableCell>{activity.description.substring(0, 50)}...</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(activity)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(activity)}
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
          open={!!activityToDelete}
          onOpenChange={(open) => !open && setActivityToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('activityDeletedDesc', { title: activityToDelete?.title || '' })}
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
