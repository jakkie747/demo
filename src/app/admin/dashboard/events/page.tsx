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
import type { Event } from "@/lib/types";
import { getEvents, addEvent, updateEvent, deleteEvent } from "@/services/eventsService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { Skeleton } from "@/components/ui/skeleton";
import { isFirebaseConfigured } from "@/lib/firebase";

const eventFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  date: z.string().min(1, "Date is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  image: z.any().optional(),
});

export default function ManageEventsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: "",
      description: "",
      image: undefined,
    },
  });

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedEvents = await getEvents();
      setEvents(fetchedEvents);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch events." });
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchEvents();
    } else {
      setIsLoading(false);
    }
  }, [fetchEvents]);

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    form.reset({
      title: event.title,
      date: event.date,
      description: event.description,
      image: undefined,
    });
  };

  const handleCancelClick = () => {
    setEditingEvent(null);
    form.reset();
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      try {
        if (eventToDelete.image) {
          await deleteImageFromUrl(eventToDelete.image);
        }
        await deleteEvent(eventToDelete.id);
        await fetchEvents();
        toast({
          title: t('eventDeleted'),
          description: t('eventDeletedDesc', { title: eventToDelete.title }),
          variant: "destructive",
        });
      } catch (error) {
         const errorMessage = (error as Error).message;
         toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not delete event." });
      } finally {
        setEventToDelete(null);
      }
    }
  };

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const file = values.image?.[0];
    let imageUrl: string | undefined = editingEvent?.image;

    try {
      if (file) {
        const newImageUrl = await uploadImage(file, 'events');
        if (editingEvent?.image) {
          await deleteImageFromUrl(editingEvent.image);
        }
        imageUrl = newImageUrl;
      }
    
      const eventPayload = {
          title: values.title,
          date: values.date,
          description: values.description,
          image: imageUrl,
      };

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventPayload);
        toast({
          title: t('eventUpdated'),
          description: t('eventUpdatedDesc', { title: values.title }),
        });
      } else {
        const newEvent: Omit<Event, 'id'> = {
          ...eventPayload,
          image: imageUrl || "https://placehold.co/600x400.png",
        };
        await addEvent(newEvent);
        toast({
          title: t('eventCreated'),
          description: t('eventCreatedDesc', { title: values.title }),
        });
      }
      await fetchEvents();
      setEditingEvent(null);
      form.reset();
    } catch (error) {
        console.error("Failed to save event:", error);
        const errorMessage = (error as Error).message;
        toast({ variant: "destructive", title: "Error", description: errorMessage || "Could not save event."});
    }
  }

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot manage events because the application is not connected to Firebase.</p>
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
          {editingEvent ? t('editEvent') : t('createNewEventTitle')}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEvent
                ? t('editing', { title: editingEvent.title })
                : t('eventDetails')}
            </CardTitle>
            <CardDescription>
              {editingEvent
                ? t('updateEventDetails')
                : t('createEventDetails')}
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
                      <FormLabel>{t('eventTitle')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('egSportsDay')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('eventDate')}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                          placeholder={t('describeEvent')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {editingEvent?.image && (
                  <div className="space-y-2">
                    <FormLabel>{t('currentImage')}</FormLabel>
                    <Image
                      src={editingEvent.image}
                      alt={editingEvent.title}
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
                      <FormLabel>{t('eventImage')}</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/gif, image/webp, image/avif"
                          onChange={(e) => onChange(e.target.files)}
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                        />
                      </FormControl>
                      <FormDescription>
                        {editingEvent
                          ? t('replaceImage')
                          : t('uploadImage')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Saving..." : editingEvent ? t('updateEvent') : t('createEvent')}
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelClick}
                      disabled={form.formState.isSubmitting}
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
          {t('existingEvents')}
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('title')}</TableHead>
                <TableHead>{t('date')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : events.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No events created yet.
                    </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(event)}
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
          open={!!eventToDelete}
          onOpenChange={(open) => !open && setEventToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('areYouSureDesc', { title: eventToDelete?.title || ''})}
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
