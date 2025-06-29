
"use client";

import { useState, useEffect } from "react";
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
import { Mail, AlertTriangle } from "lucide-react";
import { getChildren } from "@/services/childrenService";
import { Skeleton } from "@/components/ui/skeleton";
import { sendBulkEmail } from "@/services/emailService";
import { isFirebaseConfigured } from "@/lib/firebase";


const messageFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  body: z.string().min(10, "Body must be at least 10 characters long."),
});

export default function ComposeMessagePage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isConfigured] = useState(isFirebaseConfigured());

  useEffect(() => {
    if (!isConfigured) {
        setIsLoading(false);
        return;
    }
    const fetchParentEmails = async () => {
      setIsLoading(true);
      try {
        const children = await getChildren();
        const parentEmails = children
          .map((child) => child.parentEmail)
          .filter((email) => !!email);
        const uniqueEmails = [...new Set(parentEmails)];
        setEmails(uniqueEmails);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching parent emails",
          description:
            "Could not load parent emails from the children list. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchParentEmails();
  }, [toast, isConfigured]);

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  const handleSendEmail = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Form Incomplete",
        description:
          "Please make sure the subject and body meet the minimum length requirements.",
      });
      return;
    }

    if (emails.length === 0) {
      toast({
        variant: "destructive",
        title: "No Recipients",
        description: "There are no parent emails registered to send to.",
      });
      return;
    }
    
    setIsSending(true);
    const { subject, body } = form.getValues();
    
    try {
        await sendBulkEmail(subject, body, emails);
        toast({
            title: "Email Queued for Sending",
            description: "Your message will be sent shortly via the Trigger Email extension.",
        });
        form.reset();
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Error Queuing Email",
            description: (error as Error).message || "Could not queue the email. Ensure the 'Trigger Email' extension is configured.",
        });
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Compose Message
        </h2>
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertTitle>Send Email to All Parents</AlertTitle>
          <AlertDescription>
            <p>
                Use this form to draft and send an email directly to all registered parents.
            </p>
            <p className="mt-2 font-bold">
                For this to work, you must install and configure the "Trigger Email" Firebase Extension from the Firebase Console. Set it to watch the `mail` collection.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
          <CardDescription>
            Write the subject and body of your message here. The message will be sent to all parents who have provided an email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Important Update: School Concert"
                        {...field}
                        disabled={isSending}
                      />
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
                    <FormLabel>Body</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Dear parents, please remember the concert is this Friday at 6 PM..."
                        {...field}
                        rows={8}
                        disabled={isSending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-2">Recipients</h3>
            {isLoading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              <p className="text-sm text-muted-foreground">
                This email will be sent to{" "}
                <strong className="text-foreground">
                  {emails.length} unique parent emails
                </strong>
                .
              </p>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleSendEmail}
                disabled={!isConfigured || emails.length === 0 || isLoading || isSending}
              >
                {isSending ? "Queuing Email..." : (
                    <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email to All Parents
                    </>
                )}
              </Button>
            </div>
             {!isConfigured && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Firebase Not Configured</AlertTitle>
                    <AlertDescription>
                        Please configure your Firebase credentials in <code>src/lib/firebase.ts</code> to enable this feature.
                    </AlertDescription>
                </Alert>
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
