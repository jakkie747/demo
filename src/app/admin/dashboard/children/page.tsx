
"use client";

import { useState, useEffect, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren, addMultipleChildren, updateChild, deleteChild } from "@/services/childrenService";
import { uploadImage, deleteImageFromUrl } from "@/services/storageService";
import type { Child } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AlertTriangle, FileDown, FileUp, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";


const ChildAge = ({ dobString }: { dobString: string }) => {
  const [age, setAge] = useState<number | string>('');

  useEffect(() => {
    if (!dobString || isNaN(new Date(dobString).getTime())) {
      setAge("N/A");
      return;
    }
    const dob = new Date(dobString);
    const today = new Date();
    let calculatedAge = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      calculatedAge--;
    }
    setAge(calculatedAge >= 0 ? calculatedAge : "N/A");
  }, [dobString]);

  if (age === '') {
    return <Skeleton className="h-4 w-10" />;
  }

  return <>{age}</>;
};

const childFormSchema = z.object({
  name: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  dateOfBirth: z.string().refine((dob) => !isNaN(new Date(dob).getTime()), {
    message: "Please enter a valid date of birth.",
  }),
  gender: z.enum(["male", "female", "other"]),
  photo: z.any().optional(),
  
  parent: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  address: z.string().min(10, "Please enter a valid address"),

  emergencyContactName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  emergencyContactPhone: z.string().min(10, "Please enter a valid phone number"),
  
  medicalConditions: z.string().optional(),
  previousPreschool: z.enum(["yes", "no"]),
  additionalNotes: z.string().optional(),
});


export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<z.infer<typeof childFormSchema>>({
    resolver: zodResolver(childFormSchema),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: "other",
      parent: "",
      parentEmail: "",
      parentPhone: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalConditions: "",
      previousPreschool: "no",
      additionalNotes: "",
      photo: undefined,
    }
  });

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedChildren = await getChildren();
      setChildren(fetchedChildren);
    } catch (error: any) {
      if (error.message.includes("index")) {
        toast({
          variant: "destructive",
          title: "Database Index Required",
          description: "A database index is required to sort children by name. Please check the browser console (F12) for a link to create it, then try again.",
          duration: 15000,
        });
      } else {
        toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch children." });
      }
      setChildren([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchChildren();
    } else {
      setIsLoading(false);
    }
  }, [fetchChildren]);

  // Use effect to safely reset the form when a child is selected for editing
  useEffect(() => {
    if (editingChild) {
      form.reset({
        name: editingChild.name,
        dateOfBirth: editingChild.dateOfBirth,
        gender: editingChild.gender,
        photo: undefined, // Photo is handled separately
        parent: editingChild.parent,
        parentEmail: editingChild.parentEmail,
        parentPhone: editingChild.parentPhone,
        address: editingChild.address,
        emergencyContactName: editingChild.emergencyContactName,
        emergencyContactPhone: editingChild.emergencyContactPhone,
        medicalConditions: editingChild.medicalConditions || "",
        previousPreschool: editingChild.previousPreschool,
        additionalNotes: editingChild.additionalNotes || "",
      });
    } else {
      form.reset(); // Reset form when dialog is closed
    }
  }, [editingChild, form]);
  
  const handleExportCSV = () => {
    if (children.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "There are no children to export." });
      return;
    }

    const headers = [
      "name", "dateOfBirth", "gender", "address", "parent", "parentEmail", 
      "parentPhone", "photo", "medicalConditions", "emergencyContactName", 
      "emergencyContactPhone", "previousPreschool", "additionalNotes"
    ];
    
    const escapeCSV = (value: string | undefined | null) => {
        if (value === null || value === undefined) return '';
        let str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = children.map(child => 
        headers.map(header => escapeCSV(child[header as keyof Child])).join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "children-export.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleImportCSV = async () => {
    if (!importFile) {
        toast({ variant: "destructive", title: t('noFileSelected') });
        return;
    }
    setIsImporting(true);

    const parseCsvRow = (row: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"' && (i === 0 || row[i-1] !== '"')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);
        return result.map(val => val.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                throw new Error("CSV file must have a header row and at least one data row.");
            }
            
            const header = parseCsvRow(lines[0].trim());
            const dataRows = lines.slice(1);

            const newChildren: Omit<Child, 'id'>[] = dataRows.map(rowStr => {
                const values = parseCsvRow(rowStr.trim());
                const childObject: any = {};
                header.forEach((h, i) => {
                    childObject[h.trim()] = values[i] || '';
                });

                return {
                    name: childObject.name || '',
                    dateOfBirth: childObject.dateOfBirth || '',
                    gender: ['male', 'female', 'other'].includes(childObject.gender) ? childObject.gender : 'other',
                    address: childObject.address || '',
                    parent: childObject.parent || '',
                    parentEmail: childObject.parentEmail || '',
                    parentPhone: childObject.parentPhone || '',
                    photo: childObject.photo && childObject.photo.startsWith('http') ? childObject.photo : 'https://placehold.co/100x100.png',
                    medicalConditions: childObject.medicalConditions || '',
                    emergencyContactName: childObject.emergencyContactName || '',
                    emergencyContactPhone: childObject.emergencyContactPhone || '',
                    previousPreschool: ['yes', 'no'].includes(childObject.previousPreschool) ? childObject.previousPreschool : 'no',
                    additionalNotes: childObject.additionalNotes || '',
                };
            });
            
            await addMultipleChildren(newChildren);

            toast({
                title: t('importSuccess'),
                description: t('importSuccessDesc', { count: newChildren.length.toString() }),
            });
            await fetchChildren(); 
            setIsImportModalOpen(false);
            setImportFile(null);

        } catch (error) {
            console.error("Error importing children:", error);
            toast({ variant: "destructive", title: t('importError'), description: (error as Error).message || t('fileParseError') });
        } finally {
            setIsImporting(false);
        }
    };
    reader.readAsText(importFile);
  };

  const handleEditClick = (child: Child) => {
    setEditingChild(child);
  };

  const handleDeleteClick = (child: Child) => {
    setDeletingChild(child);
  };

  const confirmDelete = async () => {
    if (!deletingChild) return;
    try {
      await deleteChild(deletingChild.id);
      toast({
        title: t('childDeleted'),
        description: t('childDeletedDesc', { name: deletingChild.name }),
        variant: "destructive"
      });
      await fetchChildren();
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setDeletingChild(null);
    }
  };

  const onUpdateSubmit = async (values: z.infer<typeof childFormSchema>) => {
    if (!editingChild) return;
    setIsSaving(true);
    try {
      let photoUrl = editingChild.photo;
      const file = values.photo?.[0];
      if (file) {
        // Delete old photo only if it's a real one from storage
        if (editingChild.photo && editingChild.photo.includes('firebasestorage')) {
            await deleteImageFromUrl(editingChild.photo);
        }
        photoUrl = await uploadImage(file, 'children');
      }

      const updatedData: Partial<Child> = {
        name: values.name,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        photo: photoUrl,
        parent: values.parent,
        parentEmail: values.parentEmail,
        parentPhone: values.parentPhone,
        address: values.address,
        emergencyContactName: values.emergencyContactName,
        emergencyContactPhone: values.emergencyContactPhone,
        medicalConditions: values.medicalConditions,
        previousPreschool: values.previousPreschool,
        additionalNotes: values.additionalNotes,
      };

      await updateChild(editingChild.id, updatedData);

      toast({
        title: t('childUpdated'),
        description: t('childUpdatedDesc', { name: values.name })
      });
      await fetchChildren();
      setEditingChild(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: (error as Error).message });
    } finally {
      setIsSaving(false);
    }
  };


  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>Cannot display child profiles because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="py-6">
       <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold tracking-tight">
            {t('registeredChildrenTitle')}
        </h2>
        <div className="flex gap-2">
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><FileUp className="mr-2 h-4 w-4" />{t('importChildren')}</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('importFromCSV')}</DialogTitle>
                        <DialogDescription>{t('importCSVDesc')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="csv-file">{t('selectFile')}</Label>
                        <Input id="csv-file" type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>{t('cancel')}</Button>
                        <Button onClick={handleImportCSV} disabled={!importFile || isImporting}>
                            {isImporting ? "Importing..." : t('confirmImport')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Button onClick={handleExportCSV}><FileDown className="mr-2 h-4 w-4" />{t('exportChildren')}</Button>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('photo')}</TableHead>
                <TableHead>{t('childsName')}</TableHead>
                <TableHead>{t('ageInTable')}</TableHead>
                <TableHead>{t('parentsName')}</TableHead>
                <TableHead>{t('parentPhone')}</TableHead>
                <TableHead>{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-10 w-10 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : children.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                          No children registered yet.
                      </TableCell>
                  </TableRow>
              ) : (
                children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={child.photo} alt={child.name} />
                        <AvatarFallback>
                          {child.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{child.name}</TableCell>
                    <TableCell>
                      {child.dateOfBirth ? <ChildAge dobString={child.dateOfBirth} /> : "N/A"}
                    </TableCell>
                    <TableCell>{child.parent}</TableCell>
                    <TableCell>{child.parentPhone}</TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEditClick(child)}>
                                <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(child)}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Child Dialog */}
      <Dialog open={!!editingChild} onOpenChange={(open) => { if (!open) setEditingChild(null) }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('editChild')}</DialogTitle>
            <DialogDescription>{t('editing', { title: editingChild?.name || '' })}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onUpdateSubmit)}>
              <ScrollArea className="h-[65vh] p-4">
                <div className="space-y-8">
                  {/* Child's Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('childInfo')}</h3>
                    <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>{t('fullName')}</FormLabel> <FormControl> <Input {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem> <FormLabel>{t('dateOfBirth')}</FormLabel> <FormControl> <Input type="date" {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem> <FormLabel>{t('gender')}</FormLabel> <Select onValueChange={field.onChange} value={field.value} disabled={isSaving}> <FormControl> <SelectTrigger><SelectValue /></SelectTrigger> </FormControl> <SelectContent> <SelectItem value="male">{t('male')}</SelectItem> <SelectItem value="female">{t('female')}</SelectItem> <SelectItem value="other">{t('other')}</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    </div>
                    {editingChild?.photo && (<div className="space-y-2"><Label>{t('currentImage')}</Label><Image src={editingChild.photo} alt={editingChild.name} width={80} height={80} className="rounded-md border object-cover"/></div>)}
                    <FormField
                      control={form.control}
                      name="photo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('childPhoto')}</FormLabel>
                          <FormControl>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => field.onChange(e.target.files && e.target.files.length > 0 ? e.target.files : null)}
                              ref={field.ref}
                              name={field.name}
                              onBlur={field.onBlur}
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription>{t('replaceImage')}</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Parent Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('parentInfo')}</h3>
                    <FormField control={form.control} name="parent" render={({ field }) => ( <FormItem> <FormLabel>{t('parentsName')}</FormLabel> <FormControl> <Input {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="parentEmail" render={({ field }) => ( <FormItem> <FormLabel>{t('emailAddress')}</FormLabel> <FormControl> <Input type="email" {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="parentPhone" render={({ field }) => ( <FormItem> <FormLabel>{t('phoneNumber')}</FormLabel> <FormControl> <Input type="tel" {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                     <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>{t('physicalAddress')}</FormLabel> <FormControl> <Textarea {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  {/* Emergency & Medical Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('emergencyMedicalInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="emergencyContactName" render={({ field }) => ( <FormItem> <FormLabel>{t('emergencyContactName')}</FormLabel> <FormControl> <Input {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                      <FormField control={form.control} name="emergencyContactPhone" render={({ field }) => ( <FormItem> <FormLabel>{t('emergencyContactPhone')}</FormLabel> <FormControl> <Input type="tel" {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <FormField control={form.control} name="medicalConditions" render={({ field }) => ( <FormItem> <FormLabel>{t('medicalConditions')}</FormLabel> <FormControl> <Textarea {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  {/* Other Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">{t('otherInfo')}</h3>
                    <FormField
                      control={form.control}
                      name="previousPreschool"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>{t('previousPreschool')}</FormLabel>
                          <FormDescription>{t('previousPreschoolDesc')}</FormDescription>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex flex-col space-y-1"
                              disabled={isSaving}
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" id="edit-preschool-yes"/>
                                </FormControl>
                                <FormLabel htmlFor="edit-preschool-yes" className="font-normal">
                                  {t('yes')}
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" id="edit-preschool-no"/>
                                </FormControl>
                                <FormLabel htmlFor="edit-preschool-no" className="font-normal">
                                  {t('no')}
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField control={form.control} name="additionalNotes" render={({ field }) => ( <FormItem> <FormLabel>{t('additionalNotes')}</FormLabel> <FormControl> <Textarea {...field} disabled={isSaving} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setEditingChild(null)}>{t('cancel')}</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : t('updateChild')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Child Alert Dialog */}
      <AlertDialog open={!!deletingChild} onOpenChange={(open) => { if (!open) setDeletingChild(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('areYouSure')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('areYouSureDeleteChild', { name: deletingChild?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('deleteChild')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

    

    

    