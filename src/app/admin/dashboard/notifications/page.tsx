"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, Info } from "lucide-react";
import { queueNotificationForSending } from '@/services/notificationService';

const notificationFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  body: z.string().min(10, "Body must be at least 10 characters long."),
  url: z.string().url("Please enter a valid URL (e.g., https://example.com/events).").optional().or(z.literal('')),
});

export default function NotificationsPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isSending, setIsSending] = useState(false);

  const form = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: "",
      body: "",
      url: "/events",
    },
  });

  async function onSubmit(values: z.infer<typeof notificationFormSchema>) {
    setIsSending(true);
    try {
      await queueNotificationForSending({
        title: values.title,
        body: values.body,
        url: values.url || "/",
      });
      toast({
        title: "Notification Queued",
        description: "Your notification is being prepared and will be sent shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error queuing notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Could not queue the notification.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Send Push Notification</h2>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How This Works</AlertTitle>
          <AlertDescription>
            <p>
              This form adds your message to a queue in the database. A secure backend process (a Firebase Cloud Function, which must be deployed separately) will then read from this queue and send the notification to all registered parents.
            </p>
            <p className="mt-2 font-bold">
              You will need to deploy a Cloud Function to your Firebase project for notifications to be sent.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compose Message</CardTitle>
          <CardDescription>
            Create a message to send to all parents who have enabled notifications.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. School Concert Reminder" {...field} disabled={isSending} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Body</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g. Don't forget the concert is this Friday at 6 PM!" {...field} disabled={isSending}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="/events" {...field} disabled={isSending} />
                    </FormControl>
                    <FormDescription>
                      When a user clicks the notification, they will be taken to this page. Starts with a '/'.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSending}>
                <Bell className="mr-2 h-4 w-4" />
                {isSending ? "Queueing..." : "Queue Notification for Sending"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
