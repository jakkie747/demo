
"use client";
import { useState, useEffect } from "react";
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

const eventFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  date: z.string().min(1, "Date is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
  image: z.any().optional(),
});

type Event = z.infer<typeof eventFormSchema> & { id: string };

const initialEvents: Event[] = [
  {
    id: "EVT001",
    title: "Annual Sports Day",
    date: "2024-10-26",
    description: "A day of fun and friendly competition for everyone.",
  },
  {
    id: "EVT002",
    title: "Pajama & Movie Day",
    date: "2024-11-15",
    description: "Wear your PJs and enjoy a cozy movie day with popcorn.",
  },
  {
    id: "EVT003",
    title: "End-of-Year Concert",
    date: "2024-12-05",
    description: "A spectacular performance by our talented little stars.",
  },
];

export default function ManageEventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      date: "",
      description: "",
      image: undefined,
    },
  });

  useEffect(() => {
    if (editingEvent) {
      form.reset(editingEvent);
    } else {
      form.reset({
        title: "",
        date: "",
        description: "",
        image: undefined,
      });
    }
  }, [editingEvent, form]);

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
  };

  const handleCancelClick = () => {
    setEditingEvent(null);
  };
  
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter((event) => event.id !== eventToDelete.id));
      toast({
        title: "Event Deleted!",
        description: `The event "${eventToDelete.title}" has been successfully deleted.`,
        variant: "destructive",
      });
      setEventToDelete(null); 
    }
  };

  function onSubmit(values: z.infer<typeof eventFormSchema>) {
    if (editingEvent) {
      setEvents(
        events.map((event) =>
          event.id === editingEvent.id ? { ...event, ...values } : event
        )
      );
      toast({
        title: "Event Updated!",
        description: `The event "${values.title}" has been successfully updated.`,
      });
    } else {
      const newId =
        "EVT" +
        String(
          Math.max(...events.map((e) => parseInt(e.id.replace("EVT", ""))), 0) +
            1
        ).padStart(3, "0");

      const newEvent: Event = { id: newId, ...values };
      setEvents([...events, newEvent]);
      toast({
        title: "Event Created!",
        description: `The event "${values.title}" has been successfully created.`,
      });
    }
    setEditingEvent(null);
  }

  return (
    <div className="py-6 grid gap-10 lg:grid-cols-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          {editingEvent ? "Edit Event" : "Create New Event"}
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>
              {editingEvent ? `Editing "${editingEvent.title}"` : "Event Details"}
            </CardTitle>
            <CardDescription>
              {editingEvent
                ? "Update the details for this event."
                : "Fill in the details to create a new event for parents."}
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
                      <FormLabel>Event Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Annual Sports Day"
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
                      <FormLabel>Event Date</FormLabel>
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the event..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <FormItem>
                      <FormLabel>Event Image</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => onChange(e.target.files)}
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload an image for the event.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" className="w-full">
                    {editingEvent ? "Update Event" : "Create Event"}
                  </Button>
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleCancelClick}
                    >
                      Cancel
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
          Existing Events
        </h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
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
        <AlertDialog open={!!eventToDelete} onOpenChange={(open) => !open && setEventToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event "{eventToDelete?.title}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
