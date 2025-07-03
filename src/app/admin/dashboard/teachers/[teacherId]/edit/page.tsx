
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { Teacher } from "@/lib/types";
import { getTeacherByUid, updateTeacher } from "@/services/teacherService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";

const teacherFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  contactNumber: z.string().optional(),
  homeAddress: z.string().optional(),
  photo: z.any().optional(),
});

export default function EditTeacherPage() {
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const teacherId = params.teacherId as string;

    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [submissionError, setSubmissionError] = useState<{title: string, description: React.ReactNode} | null>(null);

    const form = useForm<z.infer<typeof teacherFormSchema>>({
        resolver: zodResolver(teacherFormSchema),
        defaultValues: {
            name: "",
            contactNumber: "",
            homeAddress: "",
            photo: undefined,
        },
    });

    const fetchTeacherData = useCallback(async () => {
        if (!teacherId) return;
        setIsLoading(true);
        try {
            const teacherData = await getTeacherByUid(teacherId);
            if (teacherData) {
                setTeacher(teacherData);
                form.reset({
                    name: teacherData.name,
                    contactNumber: teacherData.contactNumber || "",
                    homeAddress: teacherData.homeAddress || "",
                    photo: undefined,
                });
            } else {
                toast({ variant: "destructive", title: "Teacher not found" });
                router.push('/admin/dashboard/teachers');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }, [teacherId, form, router, toast]);

    useEffect(() => {
        fetchTeacherData();
    }, [fetchTeacherData]);

    const onSubmit = async (values: z.infer<typeof teacherFormSchema>) => {
        if (!teacher) return;
        setIsSaving(true);
        setSubmissionError(null);
        try {
            let photoUrl = teacher.photo;
            const file = values.photo?.[0];

            if (file) {
                if (teacher.photo && teacher.photo.includes('firebasestorage')) {
                    await deleteImageFromUrl(teacher.photo);
                }
                photoUrl = await uploadImage(file, 'teachers');
            }

            const updatedData: Partial<Teacher> = {
                name: values.name,
                contactNumber: values.contactNumber,
                homeAddress: values.homeAddress,
                photo: photoUrl,
            };

            await updateTeacher(teacher.id, updatedData);
            toast({ title: t('teacherUpdated'), description: t('teacherUpdatedDesc', { name: values.name }) });
            router.push('/admin/dashboard/teachers');

        } catch (error) {
            const errorMessage = (error as Error).message;
            let errorTitle = "Error updating teacher.";
             if (errorMessage.includes("timed out") || errorMessage.includes("storage/object-not-found") || errorMessage.toLowerCase().includes('network')) {
                errorTitle = "Save Failed: Firebase Storage Not Ready";
                setSubmissionError({
                title: errorTitle,
                description: (
                    <div className="space-y-4 text-sm">
                        <p className="font-bold text-base">This error usually means your Firebase project is not fully configured for file uploads.</p>
                        <p className="mb-2">Please complete the following one-time setup steps.</p>
                        <ol className="list-decimal list-inside space-y-4 pl-2">
                        <li><strong>Enable Firebase Storage.</strong></li>
                        <li><strong>Update Your Security Rules.</strong></li>
                        <li><strong>Set Storage CORS Policy using Cloud Shell.</strong> See SETUP_GUIDE.md for exact commands.</li>
                        <li><strong>Try Again.</strong> After completing all steps, refresh and try again.</li>
                        </ol>
                    </div>
                )
                });
            } else {
                setSubmissionError({ title: errorTitle, description: errorMessage });
            }
        } finally {
            setIsSaving(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="py-6 space-y-4">
                <Skeleton className="h-8 w-64" />
                <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
            </div>
        );
    }
    
    return (
        <div className="py-6 space-y-6">
            <div>
                <Button variant="ghost" asChild className="mb-4">
                    <Link href="/admin/dashboard/teachers"><ArrowLeft className="mr-2 h-4 w-4" /> Back to All Teachers</Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">
                    Edit Profile for {teacher?.name}
                </h2>
            </div>
            <Card className="max-w-2xl">
                 <CardHeader>
                    <CardTitle>{t('editTeacherProfile')}</CardTitle>
                    <CardDescription>{t('updateTeacherProfileDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>{t('teacherName')}</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                <FormItem><FormLabel>{t('contactNumber')}</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="homeAddress" render={({ field }) => (
                                <FormItem><FormLabel>{t('homeAddress')}</FormLabel><FormControl><Textarea {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>
                            )} />
                            
                            {teacher?.photo && (
                                <div className="space-y-2">
                                    <Label>{t('currentImage')}</Label>
                                    <Image src={teacher.photo} alt={teacher.name} width={80} height={80} className="rounded-md object-cover border" />
                                </div>
                            )}
                            
                            <FormField control={form.control} name="photo" render={({ field: { onChange } }) => (
                                <FormItem>
                                    <FormLabel>{t('teacherPhoto')}</FormLabel>
                                    <FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} disabled={isSaving} /></FormControl>
                                    <FormDescription>{teacher?.photo ? t('replaceImage') : t('uploadImage')}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            {submissionError && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>{submissionError.title}</AlertTitle>
                                    <AlertDescription>{submissionError.description}</AlertDescription>
                                </Alert>
                            )}
                            
                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : t('saveChanges')}</Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>{t('cancel')}</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
