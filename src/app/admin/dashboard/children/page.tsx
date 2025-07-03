
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { intervalToDuration } from 'date-fns';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren, addMultipleChildren, deleteChild } from "@/services/childrenService";
import type { Child } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AlertTriangle, FileDown, FileUp, Trash2, Edit, FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const ChildAge = ({ dobString }: { dobString: string }) => {
  const [age, setAge] = useState<string>('');

  useEffect(() => {
    if (!dobString || isNaN(new Date(dobString).getTime())) {
      setAge("N/A");
      return;
    }
    const dob = new Date(dobString);
    const today = new Date();

    if (dob > today) {
      setAge("Future date");
      return;
    }

    const duration = intervalToDuration({ start: dob, end: today });
    
    const years = duration.years || 0;
    const months = duration.months || 0;

    const yearString = `${years} year${years !== 1 ? 's' : ''}`;
    const monthString = `${months} month${months !== 1 ? 's' : ''}`;

    if (years > 0) {
      setAge(`${yearString} ${monthString}`);
    } else {
      setAge(monthString);
    }
  }, [dobString]);

  if (age === '') {
    return <Skeleton className="h-4 w-24" />;
  }

  return <>{age}</>;
};


export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());
  
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [deletingChild, setDeletingChild] = useState<Child | null>(null);
  

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
    if (isConfigured) {
      fetchChildren();
    } else {
      setIsLoading(false);
    }
  }, [isConfigured, fetchChildren]);
  
  const handleExportCSV = () => {
    if (children.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "There are no children to export." });
      return;
    }

    const headers = [
      "name", "dateOfBirth", "gender", "address", "parent", "parentEmail", 
      "parentPhone", "medicalConditions", "emergencyContactName", 
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

  const headers = "name,dateOfBirth,gender,address,parent,parentEmail,parentPhone,medicalConditions,emergencyContactName,emergencyContactPhone,previousPreschool,additionalNotes";

  const handleCopyHeaders = () => {
    navigator.clipboard.writeText(headers);
    toast({ title: "Copied!", description: "CSV headers copied to clipboard." });
  };
  
  const handleImportCSV = async () => {
    if (!importFile) {
        toast({ variant: "destructive", title: t('noFileSelected') });
        return;
    }
    setIsImporting(true);

    const parseCsvRow = (row: string): string[] => {
      const result: string[] = [];
      let field = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            field += '"'; // This is an escaped quote
            i++; // Skip the next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(field);
          field = '';
        } else {
          field += char;
        }
      }
      result.push(field);
      return result;
    };


    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim() !== '');
            if (lines.length < 2) {
                throw new Error("CSV file must have a header row and at least one data row.");
            }
            
            const header = parseCsvRow(lines[0].trim().replace(/\r/g, ''));
            const dataRows = lines.slice(1);

            const newChildren: Omit<Child, 'id'>[] = dataRows.map(rowStr => {
                const values = parseCsvRow(rowStr.trim().replace(/\r/g, ''));
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
                    photo: 'https://placehold.co/100x100.png',
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
    <div className="py-6 space-y-6">
       <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">
            {t('registeredChildrenTitle')}
        </h2>
        <div className="hidden md:flex gap-2">
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline"><FileUp className="mr-2 h-4 w-4" />{t('importChildren')}</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                      <DialogTitle>{t('importFromCSV')}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">{t('importCSVDesc')}</p>
                      <div>
                          <div className="flex justify-between items-center mb-1">
                              <p className="text-sm font-semibold text-foreground">Required CSV Header:</p>
                              <Button variant="ghost" size="sm" onClick={handleCopyHeaders} className="h-7">
                                  <Copy className="mr-2 h-3 w-3" />
                                  Copy
                              </Button>
                          </div>
                          <code className="text-xs text-muted-foreground bg-muted p-2 rounded-md block break-all">
                              {headers}
                          </code>
                      </div>
                      <Alert variant="default" className="text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Field Values</AlertTitle>
                          <AlertDescription>
                              The <code className="text-xs bg-muted p-1 rounded-sm">gender</code> column must be one of <code className="text-xs bg-muted p-1 rounded-sm">male</code>, <code className="text-xs bg-muted p-1 rounded-sm">female</code>, or <code className="text-xs bg-muted p-1 rounded-sm">other</code>.<br/>
                              The <code className="text-xs bg-muted p-1 rounded-sm">previousPreschool</code> column must be <code className="text-xs bg-muted p-1 rounded-sm">yes</code> or <code className="text-xs bg-muted p-1 rounded-sm">no</code>.
                          </AlertDescription>
                      </Alert>
                  </div>
                  <div className="grid w-full items-center gap-1.5 mt-4">
                      <Label htmlFor="csv-file">{t('selectFile')}</Label>
                      <Input id="csv-file" type="file" accept=".csv" onChange={(e) => setImportFile(e.target.files ? e.target.files[0] : null)} />
                  </div>
                  <DialogFooter className="sm:justify-start mt-4">
                      <Button onClick={handleImportCSV} disabled={!importFile || isImporting}>
                          {isImporting ? "Importing..." : t('confirmImport')}
                      </Button>
                      <DialogClose asChild>
                        <Button type="button" variant="secondary">
                          Close
                        </Button>
                      </DialogClose>
                  </DialogFooter>
                </DialogContent>
            </Dialog>
            <Button onClick={handleExportCSV}><FileDown className="mr-2 h-4 w-4" />{t('exportChildren')}</Button>
        </div>
      </div>
      <div className="w-full overflow-x-auto">
        <Card>
            <CardContent className="p-0">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>{t('childsName')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('parentDetails')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('ageInTable')}</TableHead>
                    <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                        <TableCell><Skeleton className="h-6 w-40" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-48" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 inline-block" /></TableCell>
                    </TableRow>
                    ))
                ) : children.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No children registered yet.
                        </TableCell>
                    </TableRow>
                ) : (
                    <TooltipProvider>
                    {children.map((child) => (
                    <TableRow key={child.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={child.photo} alt={child.name} />
                                    <AvatarFallback>{child.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{child.name}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                            <div className="flex flex-col text-sm">
                                <span className="font-medium">{child.parent}</span>
                                <span className="text-muted-foreground">{child.parentEmail}</span>
                            </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                            {child.dateOfBirth ? <ChildAge dobString={child.dateOfBirth} /> : "N/A"}
                        </TableCell>
                        <TableCell>
                            <div className="flex gap-1 justify-end">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/dashboard/children/${child.id}/reports`}><FileText className="h-4 w-4" /></Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Manage Daily Reports</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button asChild variant="ghost" size="icon">
                                            <Link href={`/admin/dashboard/children/${child.id}/edit`}><Edit className="h-4 w-4" /></Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Edit Child Profile</p></TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(child)}><Trash2 className="h-4 w-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>Delete Child Profile</p></TooltipContent>
                                </Tooltip>
                            </div>
                        </TableCell>
                    </TableRow>
                    ))}
                    </TooltipProvider>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
      </div>
      
      <AlertDialog open={!!deletingChild} onOpenChange={(open) => { if (!open) setDeletingChild(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
