"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Baby, Home, User, Mail, Phone, Upload, AlertTriangle } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { addChild } from "@/services/childrenService";
import type { Child } from "@/lib/types";
import { uploadImage } from "@/services/storageService";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";

const formSchema = z.object({
  childName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  childAge: z.coerce
    .number()
    .min(1, "Age must be at least 1")
    .max(6, "Age must be at most 6"),
  childGender: z.enum(["male", "female", "other"]),
  address: z.string().min(10, "Please enter a valid address"),
  parentName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  childPhoto: z.any().optional(),
});


export default function RegisterPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);

  useEffect(() => {
    setIsConfigured(isFirebaseConfigured());
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      childAge: "" as any,
      address: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childPhoto: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmissionError(null);
    if (!isConfigured) {
      setSubmissionError({
        title: "Firebase Not Configured",
        description: "Please configure your Firebase credentials in src/lib/firebase.ts before saving.",
      });
      return;
    }

    setIsSubmitting(true);
    const file = values.childPhoto?.[0];
    let photoUrl = "https://placehold.co/100x100.png";

    try {
      if (file) {
        photoUrl = await uploadImage(file, 'children');
      }

      const newChildData: Omit<Child, "id"> = {
        name: values.childName,
        age: values.childAge,
        parent: values.parentName,
        parentEmail: values.parentEmail,
        parentPhone: values.parentPhone,
        photo: photoUrl,
      };

      await addChild(newChildData);

      toast({
        title: t('regSuccessTitle'),
        description: t('regSuccessDesc', { childName: values.childName }),
      });
      form.reset();

    } catch (error) {
      const errorMessage = (error as Error).message || "There was a problem saving the registration.";
      let errorTitle = "Uh oh! Something went wrong.";
      
      if (errorMessage.includes("timed out")) {
        errorTitle = "Image Upload Timed Out (Firebase Security Rules)";
        setSubmissionError({
          title: errorTitle,
          description: (
             <div className="space-y-4 text-sm">
                <p>This is a common Firebase setup issue. Please follow these steps carefully.</p>
                
                <div className="font-bold">Step 1: Update Firestore (Database) Rules</div>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                    <li>Open your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`} target="_blank" rel="noopener noreferrer" className="underline">Firebase Console Firestore Rules</a>.</li>
                    <li>Replace the existing rules with the content from the <strong>firestore.rules</strong> file in your project, then click <strong>Publish</strong>.</li>
                </ol>

                <div className="font-bold">Step 2: Enable Storage & Update Rules</div>
                 <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>
                        <strong>CRITICAL: Enable Firebase Storage.</strong> Go to your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`} target="_blank" rel="noopener noreferrer" className="underline">Firebase Console Storage section</a>. If you see a "Get Started" screen, follow the prompts to enable Storage. <strong>This must be done before the next steps.</strong>
                    </li>
                    <li>
                        Open your <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/rules`} target="_blank" rel="noopener noreferrer" className="underline">Firebase Console Storage Rules</a>.
                    </li>
                    <li>
                        Replace the existing rules with the content from the <strong>storage.rules</strong> file in your project, then click <strong>Publish</strong>.
                    </li>
                    <li>
                        Apply the CORS policy by running these commands in the <a href={`https://console.cloud.google.com/home/dashboard?project=${firebaseConfig.projectId}&cloudshell=true`} target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Shell</a>. The "bucket does not exist" error will happen if Step 2.1 was skipped.
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-2">{"echo '[{\"origin\": [\"*\"], \"method\": [\"GET\", \"PUT\", \"POST\"], \"responseHeader\": [\"Content-Type\"], \"maxAgeSeconds\": 3600}]' > cors.json"}</pre>
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-1">{`gsutil cors set cors.json gs://${firebaseConfig.storageBucket}`}</pre>
                    </li>
                </ol>
            </div>
          )
        });
      } else {
        setSubmissionError({ title: errorTitle, description: errorMessage });
      }

    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-12 md:py-24">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            {t('registerTitle')}
          </CardTitle>
          <CardDescription>
            {t('registerSub')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isConfigured && (
              <Alert variant="destructive" className="mb-8">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Firebase Configuration Error</AlertTitle>
                  <AlertDescription>
                      <p>Cannot submit registration because the application is not connected to the database.</p>
                      <p className="mt-2 font-bold">Please contact the administrator or, if you are the admin, update <code>src/lib/firebase.ts</code> with your project credentials.</p>
                  </AlertDescription>
              </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <h3 className="text-xl font-headline text-primary/80">
                {t('childInfo')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="childName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('fullName')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Baby className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder={t('egJaneDoe')}
                            {...field}
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="childAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('age')}</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder={t('eg3')} {...field} disabled={isSubmitting}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('gender')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('selectGender')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">{t('male')}</SelectItem>
                            <SelectItem value="female">{t('female')}</SelectItem>
                            <SelectItem value="other">{t('other')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="childPhoto"
                render={({ field: { onChange, onBlur, name, ref } }) => (
                  <FormItem>
                    <FormLabel>{t('childPhoto')}</FormLabel>
                     <FormControl>
                      <div className="relative">
                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/gif, image/webp, image/avif"
                          onChange={(e) => onChange(e.target.files)}
                          onBlur={onBlur}
                          name={name}
                          ref={ref}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      {t('childPhotoDesc')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-xl font-headline text-primary/80 pt-4">
                {t('parentInfo')}
              </h3>
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('fullName')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder={t('egJohnSmith')}
                          {...field}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('emailAddress')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder={t('egEmail')}
                            {...field}
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('phoneNumber')}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder={t('egPhone')}
                            {...field}
                            className="pl-10"
                            disabled={isSubmitting}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('physicalAddress')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Textarea
                          placeholder={t('egAddress')}
                          {...field}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full font-semibold" disabled={isSubmitting || !isConfigured}>
                 {isSubmitting ? "Submitting..." : t('submitRegistration')}
              </Button>
               {submissionError && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{submissionError.title}</AlertTitle>
                  <AlertDescription>
                    {submissionError.description}
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
