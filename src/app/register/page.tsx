
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Baby, Home, User, Mail, Phone, Upload, AlertTriangle, HeartPulse, Shield, FileText, Calendar } from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLanguage } from "@/context/LanguageContext";
import { addChild } from "@/services/childrenService";
import type { Child } from "@/lib/types";
import { uploadImage } from "@/services/storageService";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";

const formSchema = z.object({
  childName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  dateOfBirth: z.string().refine((dob) => dob && !isNaN(new Date(dob).getTime()), {
    message: "Please enter a valid date of birth.",
  }),
  childGender: z.enum(["male", "female", "other"]),
  childPhoto: z.any().optional(),
  
  parentName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),

  emergencyContactName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  emergencyContactPhone: z.string().min(10, "Please enter a valid phone number"),
  
  medicalConditions: z.string().optional(),
  previousPreschool: z.enum(["yes", "no"]),
  additionalNotes: z.string().optional(),
});


export default function RegisterPage() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConfigured] = useState(isFirebaseConfigured());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      dateOfBirth: "",
      address: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
      childPhoto: undefined,
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      additionalNotes: "",
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
        dateOfBirth: values.dateOfBirth,
        gender: values.childGender,
        address: values.address,
        parent: values.parentName,
        parentEmail: values.parentEmail,
        parentPhone: values.parentPhone,
        photo: photoUrl,
        medicalConditions: values.medicalConditions,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        previousPreschool: values.previousPreschool,
        additionalNotes: values.additionalNotes,
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
      
      if (errorMessage.includes("timed out") || errorMessage.includes("storage/object-not-found")) {
        errorTitle = "Save Failed: Firebase Storage Not Ready";
        setSubmissionError({
          title: errorTitle,
          description: (
             <div className="space-y-4 text-sm">
                <p className="font-bold text-base">
                  This error almost always means your Firebase project is not fully configured for file uploads. The storage 'bucket' does not exist until you activate it.
                </p>
                <p className="mb-2">Please complete the following one-time setup steps.</p>

                <ol className="list-decimal list-inside space-y-4 pl-2">
                  <li>
                    <strong>Crucial First Step: Enable Firebase Storage.</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                      <li>
                        Go to your{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold"
                        >
                          Firebase Console Storage section
                        </a>
                        .
                      </li>
                      <li>
                        If you see a "Get Started" screen, you **must** click through the prompts to enable it. This creates the storage bucket. If you do not do this, the next steps will fail.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Update Your Security Rules.</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                      <li>
                         Open your{' '}
                        <a
                          href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage/rules`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Storage Rules
                        </a> and replace the content with the rules from the `storage.rules` file in your project. Click <strong>Publish</strong>.
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Set Storage CORS Policy using Cloud Shell.</strong>
                    <ul className="list-disc list-inside pl-4 mt-1 space-y-2">
                      <li>
                        This step is required to allow your web app to upload files. Open the{' '}
                        <a
                          href={`https://console.cloud.google.com/home/dashboard?project=${firebaseConfig.projectId}&cloudshell=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          Google Cloud Shell
                        </a>
                        .
                      </li>
                      <li>
                        Run these two commands one by one. Copy them exactly.
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-2 select-all">
                          {
                            `echo '[{"origin": ["*"], "method": ["GET", "PUT", "POST"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json`
                          }
                        </pre>
                        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto mt-1 select-all">{`gsutil cors set cors.json gs://${firebaseConfig.storageBucket}`}</pre>
                      </li>
                    </ul>
                  </li>
                  <li>
                      <strong>Try Again.</strong>
                       <p>After completing all these steps, refresh this page and try submitting the registration again.</p>
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
              {/* Child's Information */}
              <div className="space-y-4">
                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2">
                  <Baby /> {t('childInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                    control={form.control}
                    name="childName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('fullName')}</FormLabel>
                        <FormControl>
                            <Input
                            placeholder={t('egJaneDoe')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>{t('dateOfBirth')}</FormLabel>
                           <FormControl>
                              <Input 
                                type="text" 
                                placeholder={t('egDob')}
                                {...field} 
                                disabled={isSubmitting}
                                className="w-full"
                              />
                            </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                     <FormField
                        control={form.control}
                        name="childPhoto"
                        render={({ field: { onChange, onBlur, name, ref } }) => (
                        <FormItem>
                            <FormLabel>{t('childPhoto')}</FormLabel>
                            <FormControl>
                                <Input
                                type="file"
                                accept="image/png, image/jpeg, image/gif, image/webp, image/avif"
                                onChange={(e) => onChange(e.target.files)}
                                onBlur={onBlur}
                                name={name}
                                ref={ref}
                                disabled={isSubmitting}
                                />
                            </FormControl>
                             <FormDescription>{t('childPhotoDesc')}</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
              </div>
              
              {/* Parent Information */}
               <div className="space-y-4 pt-4">
                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2">
                   <User /> {t('parentInfo')}
                </h3>
                <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('fullName')}</FormLabel>
                        <FormControl>
                            <Input
                            placeholder={t('egJohnSmith')}
                            {...field}
                            disabled={isSubmitting}
                            />
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
                           <Input
                            type="email"
                            placeholder={t('egEmail')}
                            {...field}
                            disabled={isSubmitting}
                            />
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
                           <Input
                            type="tel"
                            placeholder={t('egPhone')}
                            {...field}
                            disabled={isSubmitting}
                            />
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
                           <Textarea
                            placeholder={t('egAddress')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

               {/* Emergency & Medical Information */}
               <div className="space-y-4 pt-4">
                 <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2">
                   <HeartPulse /> {t('emergencyMedicalInfo')}
                </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                        control={form.control}
                        name="emergencyContactName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('emergencyContactName')}</FormLabel>
                            <FormControl>
                                <Input
                                placeholder={t('egEmergencyContact')}
                                {...field}
                                disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="emergencyContactPhone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('emergencyContactPhone')}</FormLabel>
                            <FormControl>
                                <Input
                                type="tel"
                                placeholder={t('egEmergencyPhone')}
                                {...field}
                                disabled={isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                 </div>
                 <FormField
                    control={form.control}
                    name="medicalConditions"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('medicalConditions')}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={t('egMedical')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                         <FormDescription>{t('medicalConditionsDesc')}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>

              {/* Other Information */}
               <div className="space-y-4 pt-4">
                 <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2">
                   <FileText /> {t('otherInfo')}
                </h3>
                 <FormField
                    control={form.control}
                    name="previousPreschool"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>{t('previousPreschool')}</FormLabel>
                             <FormDescription>{t('previousPreschoolDesc')}</FormDescription>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                                disabled={isSubmitting}
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="yes" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {t('yes')}
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="no" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    {t('no')}
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('additionalNotes')}</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder={t('egNotes')}
                            {...field}
                            disabled={isSubmitting}
                            />
                        </FormControl>
                         <FormDescription>{t('additionalNotesDesc')}</FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>

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

    