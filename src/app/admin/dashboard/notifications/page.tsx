
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
import { Mail, MessageCircle, Info } from "lucide-react";
import { getChildren } from "@/services/childrenService";
import { Skeleton } from "@/components/ui/skeleton";

const messageFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters long."),
  body: z.string().min(10, "Body must be at least 10 characters long."),
});

export default function ComposeMessagePage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [emails, setEmails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
  }, [toast]);

  const form = useForm<z.infer<typeof messageFormSchema>>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      subject: "",
      body: "",
    },
  });

  const handleComposeEmail = () => {
    const { subject, body } = form.getValues();
     if (!form.formState.isValid) {
      toast({
        variant: "destructive",
        title: "Form Incomplete",
        description: "Please fill out a subject and body for your message.",
      });
      return;
    }
    if (emails.length === 0) {
      toast({
        variant: "destructive",
        title: "No Recipients",
        description: "There are no parent emails registered in the system.",
      });
      return;
    }

    const bcc = emails.join(',');
    const mailtoLink = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const handleComposeWhatsapp = () => {
    const { subject, body } = form.getValues();
     if (!form.formState.isValid) {
      toast({
        variant: "destructive",
        title: "Form Incomplete",
        description: "Please fill out a subject and body for your message.",
      });
      return;
    }

    const message = `*${subject}*\n\n${body}`;
    const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappLink, '_blank');
  };

  return (
    <div className="py-6 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">
          Compose Message
        </h2>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How This Works</AlertTitle>
          <AlertDescription>
            <p>
              Use this form to draft a message. Then, click one of the buttons below to open the message in your default email client or WhatsApp.
            </p>
            <p className="mt-2">
              For email, all registered parent emails will be automatically added to the BCC field for privacy. For WhatsApp, you can copy the message and paste it into your parent groups.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Details</CardTitle>
          <CardDescription>
            Write the subject and body of your message here.
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
                      <Input placeholder="e.g. Important Update: School Concert" {...field} />
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
                    This message will be prepared for{' '}
                    <strong className="text-foreground">{emails.length} unique parent emails</strong>.
                </p>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                <Button onClick={handleComposeEmail} disabled={emails.length === 0 || isLoading}>
                    <Mail className="mr-2 h-4 w-4" />
                    Compose for Email
                </Button>
                <Button onClick={handleComposeWhatsapp} variant="secondary">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Compose for WhatsApp
                </Button>
            </div>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
