
"use client";
import { useState, useEffect } from "react";
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
import { Edit, Trash2 } from "lucide-react";
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
import { useLanguage } from "@/context/LanguageContext";

const eventFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  date: z.string().min(1, "Date is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  image: z.any().optional(),
});

type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
};

const initialEvents: Event[] = [
  {
    id: "EVT001",
    title: "Annual Sports Day",
    date: "2024-10-26",
    description: "A day of fun and friendly competition for everyone.",
    image: "https://placehold.co/600x400.png",
  },
  {
    id: "EVT002",
    title: "Pajama & Movie Day",
    date: "2024-11-15",
    description: "Wear your PJs and enjoy a cozy movie day with popcorn.",
    image: "https://placehold.co/600x400.png",
  },
  {
    id: "EVT003",
    title: "End-of-Year Concert",
    date: "2024-12-05",
    description: "A spectacular performance by our talented little stars.",
    image: "https://placehold.co/600x400.png",
  },
];

export default function ManageEventsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  useEffect(() => {
    try {
      const storedEventsJSON = localStorage.getItem("events");
      const storedEvents = storedEventsJSON
        ? JSON.parse(storedEventsJSON)
        : initialEvents;
      setEvents(storedEvents);
      if (!storedEventsJSON) {
        localStorage.setItem("events", JSON.stringify(initialEvents));
      }
    } catch (error) {
      console.error("Failed to load events from local storage", error);
      setEvents(initialEvents);
    }
  }, []);

  const updateAndStoreEvents = (updatedEvents: Event[]) => {
    setEvents(updatedEvents);
    localStorage.setItem("events", JSON.stringify(updatedEvents));
  };

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: "",
      description: "",
      image: undefined,
    },
  });

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

  const confirmDelete = () => {
    if (eventToDelete) {
      const updatedEvents = events.filter(
        (event) => event.id !== eventToDelete.id
      );
      updateAndStoreEvents(updatedEvents);
      toast({
        title: t('eventDeleted'),
        description: t('eventDeletedDesc', { title: eventToDelete.title }),
        variant: "destructive",
      });
      setEventToDelete(null);
    }
  };

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    const file = values.image?.[0];
    let imageDataUrl: string | undefined = editingEvent?.image;

    if (file) {
      try {
        imageDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "File Upload Error",
          description: "Could not process the uploaded image.",
        });
        return;
      }
    }

    if (editingEvent) {
      const updatedEvents = events.map((event) =>
        event.id === editingEvent.id
          ? { ...event, ...values, image: imageDataUrl }
          : event
      );
      updateAndStoreEvents(updatedEvents);
      toast({
        title: t('eventUpdated'),
        description: t('eventUpdatedDesc', { title: values.title }),
      });
    } else {
      const newId =
        "EVT" +
        String(
          Math.max(
            ...events.map((e) => parseInt(e.id.replace("EVT", ""))),
            0
          ) + 1
        ).padStart(3, "0");

      const newEvent: Event = {
        id: newId,
        ...values,
        image: imageDataUrl || "https://placehold.co/600x400.png",
      };
      updateAndStoreEvents([...events, newEvent]);
      toast({
        title: t('eventCreated'),
        description: t('eventCreatedDesc', { title: values.title }),
      });
    }
    setEditingEvent(null);
    form.reset();
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
                      unoptimized
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
                  <Button type="submit" className="w-full">
                    {editingEvent ? t('updateEvent') : t('createEvent')}
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelClick}
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
              {events.map((event) => (
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
              ))}
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
