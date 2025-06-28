
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { AlertTriangle, FileDown, FileUp, Trash2, HeartPulse } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


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


export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  
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
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    if (configured) {
      fetchChildren();
    } else {
      setIsLoading(false);
    }
  }, [fetchChildren]);
  
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
                <TableHead>{t('gender')}</TableHead>
                <TableHead>{t('parentDetails')}</TableHead>
                <TableHead>{t('emergencyContact')}</TableHead>
                <TableHead>{t('medicalNotes')}</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-12 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-6" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-10" /></TableCell>
                  </TableRow>
                ))
              ) : children.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                          No children registered yet.
                      </TableCell>
                  </TableRow>
              ) : (
                <TooltipProvider>
                {children.map((child) => (
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
                    <TableCell className="capitalize">{child.gender}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{child.parent}</span>
                        <span className="text-muted-foreground">{child.parentEmail}</span>
                        <span className="text-muted-foreground">{child.parentPhone}</span>
                      </div>
                    </TableCell>
                     <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-medium">{child.emergencyContactName}</span>
                          <span className="text-muted-foreground">{child.emergencyContactPhone}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                      {child.medicalConditions && child.medicalConditions.trim() !== '' ? (
                        <Tooltip>
                          <TooltipTrigger>
                            <HeartPulse className="h-5 w-5 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-[300px] whitespace-pre-wrap">{child.medicalConditions}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(child)}>
                                <Trash2 className="h-4 w-4" />
                           </Button>
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

    