
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Baby, HeartPulse, User, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

import type { Child } from "@/lib/types";
import { getChildById, updateChild } from "@/services/childrenService";
import { getAfterschoolChildById, updateAfterschoolChild } from "@/services/afterschoolService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import { serverTimestamp } from "firebase/firestore";

const parentEditSchema = z.object({
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),
  emergencyContactName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  emergencyContactPhone: z.string().min(10, "Please enter a valid phone number"),
  medicalConditions: z.string().optional(),
  additionalNotes: z.string().optional(),
  childPhoto: z.any().optional(),
});

type ParentEditFormData = z.infer<typeof parentEditSchema>;

export default function ParentEditChildPage() {
    const { toast } = useToast();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    
    const childId = params.childId as string;
    const program = searchParams.get('program') as 'preschool' | 'afterschool' | null;

    const [child, setChild] = useState<Child | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const form = useForm<ParentEditFormData>({
        resolver: zodResolver(parentEditSchema),
    });

    const fetchChildData = useCallback(async () => {
        if (!childId || !program) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const fetcher = program === 'preschool' ? getChildById : getAfterschoolChildById;
            const childData = await fetcher(childId);
            
            if (childData && childData.parentEmail === user?.email) {
                setChild(childData);
                form.reset({
                    parentPhone: childData.parentPhone || '',
                    address: childData.address || '',
                    emergencyContactName: childData.emergencyContactName || '',
                    emergencyContactPhone: childData.emergencyContactPhone || '',
                    medicalConditions: childData.medicalConditions || '',
                    additionalNotes: childData.additionalNotes || '',
                });
            } else {
                toast({ variant: "destructive", title: "Unauthorized", description: "You do not have permission to edit this profile." });
                router.push('/parent/dashboard');
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: (error as Error).message });
        } finally {
            setIsLoading(false);
        }
    }, [childId, program, form, router, toast, user?.email]);

    useEffect(() => {
        if(user) { // Only fetch data when user is available
            fetchChildData();
        }
    }, [user, fetchChildData]);
    
    const onSubmit = async (values: ParentEditFormData) => {
        if (!child || !program) return;
        setIsSaving(true);
        setSubmissionError(null);
        try {
            let photoUrl = child.photo;
            const file = values.childPhoto?.[0];

            if (file) {
                if (child.photo && child.photo.includes('firebasestorage')) {
                  await deleteImageFromUrl(child.photo);
                }
                photoUrl = await uploadImage(file, 'children');
            }

            const updateData: Partial<Omit<Child, 'id'>> = {
                parentPhone: values.parentPhone,
                address: values.address,
                emergencyContactName: values.emergencyContactName,
                emergencyContactPhone: values.emergencyContactPhone,
                medicalConditions: values.medicalConditions,
                additionalNotes: values.additionalNotes,
                photo: photoUrl,
                updatedByParentAt: serverTimestamp(),
            };

            const updater = program === 'preschool' ? updateChild : updateAfterschoolChild;
            await updater(child.id, updateData);
            
            toast({ title: "Profile Updated", description: `${child.name}'s profile has been successfully updated.` });
            router.push('/parent/dashboard');
            
        } catch (error) {
            console.error("Profile update error:", error);
            setSubmissionError((error as Error).message || "An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !child) {
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
                    <Link href="/parent/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight">
                    Edit Profile for {child.name}
                </h2>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Child's Details</CardTitle>
                    <CardDescription>Update your child's information below. Some fields can only be changed by the school administrator.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            {/* Read-only Child Info */}
                            <div className="space-y-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><Baby /> Child's Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem><FormLabel>Full Name</FormLabel><Input value={child.name} disabled /></FormItem>
                                    <FormItem><FormLabel>Date of Birth</FormLabel><Input value={child.dateOfBirth} disabled /></FormItem>
                                    <FormItem><FormLabel>Gender</FormLabel><Input value={child.gender} disabled className="capitalize"/></FormItem>
                                    <div className="space-y-2">
                                        <FormLabel>Current Photo</FormLabel>
                                        <Image src={child.photo || ''} alt="Current photo" width={60} height={60} className="rounded-md object-cover"/>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Editable Parent Info */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><User /> Your Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormItem><FormLabel>Your Name</FormLabel><Input value={child.parent} disabled /></FormItem>
                                    <FormItem><FormLabel>Your Email</FormLabel><Input value={child.parentEmail} disabled /></FormItem>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="parentPhone" render={({ field }) => (<FormItem><FormLabel>Your Phone</FormLabel><FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="address" render={({ field }) => (<FormItem><FormLabel>Physical Address</FormLabel><FormControl><Textarea {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            
                            {/* Editable Emergency, Medical & Other Info */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-xl font-headline text-primary/80 flex items-center gap-2"><HeartPulse /> Emergency, Medical & Other</h3>
                                <FormField control={form.control} name="childPhoto" render={({ field: { onChange } }) => (<FormItem><FormLabel>Replace Photo</FormLabel><FormControl><Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files)} disabled={isSaving} /></FormControl><FormDescription>Upload a new photo to replace the old one.</FormDescription><FormMessage /></FormItem>)} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="emergencyContactName" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Name</FormLabel><FormControl><Input {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => (<FormItem><FormLabel>Emergency Contact Phone</FormLabel><FormControl><Input type="tel" {...field} disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="medicalConditions" render={({ field }) => (<FormItem><FormLabel>Medical Conditions / Allergies</FormLabel><FormControl><Textarea {...field} placeholder="e.g. Peanut allergy" disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="additionalNotes" render={({ field }) => (<FormItem><FormLabel>Additional Notes</FormLabel><FormControl><Textarea {...field} placeholder="Anything else the teachers should know?" disabled={isSaving} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>Cancel</Button>
                            </div>
                            {submissionError && (
                                <Alert variant="destructive" className="mt-4">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Update Failed</AlertTitle>
                                    <AlertDescription>{submissionError}</AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
