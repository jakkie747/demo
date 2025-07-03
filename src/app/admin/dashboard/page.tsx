
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, PlusCircle, AlertTriangle, FileText, GalleryHorizontal, Lightbulb, Mail, Briefcase, FileUp, FileDown, Copy } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren, addMultipleChildren } from "@/services/childrenService";
import { getEvents } from "@/services/eventsService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured, firebaseConfig } from "@/lib/firebase";
import { useAdminAuth } from "@/context/AdminAuthContext";
import type { Child } from "@/lib/types";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function DashboardPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isConfigured] = useState(isFirebaseConfigured());
  const { teacher, loading: authLoading } = useAdminAuth();
  const userRole = teacher?.role;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [childrenData, events] = await Promise.all([
        getChildren(),
        getEvents(),
      ]);
      setChildren(childrenData);
      setEventsCount(events.length);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not fetch dashboard data." });
      setChildren([]);
      setEventsCount(0);
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    if (authLoading) return; // Wait until auth state is resolved

    if (!isConfigured) {
      setIsLoadingData(false);
      return;
    }
    
    fetchData();
  }, [isConfigured, toast, authLoading, fetchData]);

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
            await fetchData();
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


  const isLoading = authLoading || isLoadingData;

  if (!isConfigured) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            <p>The dashboard cannot be displayed because the application is not connected to Firebase.</p>
            <p className="mt-2 font-bold">Please open the file <code>src/lib/firebase.ts</code> and follow the instructions to add your Firebase credentials.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("registeredChildren")}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{children.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {/* This can be made dynamic later */}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("upcomingEventsCard")}
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {isLoading ? (
              <Skeleton className="h-8 w-10" />
            ) : (
              <div className="text-2xl font-bold">{eventsCount}</div>
            )}
            <p className="text-xs text-muted-foreground">
               {/* This can be made dynamic later */}
            </p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center items-center bg-accent/20 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">{t("createNewEvent")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/admin/dashboard/events">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("newEvent")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4">{t("quickLinks")}</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("viewAllChildren")}</CardTitle>
              <CardDescription>{t("viewAllChildrenDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/children">
                  {t("manageChildren")}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("manageEventsCard")}</CardTitle>
              <CardDescription>{t("manageEventsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/events">{t("manageEvents")}</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{t("manageGallery")}</CardTitle>
              <CardDescription>{t("manageGalleryDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/activities">
                  {t("manageGallery")}
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
                <CardTitle>{t("manageDocuments")}</CardTitle>
                <CardDescription>{t("manageDocumentsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard/documents">{t("manageDocuments")}</Link>
                </Button>
            </CardContent>
          </Card>
           {userRole === 'admin' && (
            <Card>
                <CardHeader>
                <CardTitle>{t("manageTeachers")}</CardTitle>
                <CardDescription>{t("manageTeachersDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard/teachers">
                    <Briefcase className="mr-2 h-4 w-4" />
                    {t("manageTeachers")}
                    </Link>
                </Button>
                </CardContent>
            </Card>
           )}
           <Card>
            <CardHeader>
              <CardTitle>{t("composeMessage")}</CardTitle>
              <CardDescription>{t("composeMessageDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/admin/dashboard/notifications">
                  {t("composeMessage")}
                </Link>
              </Button>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
                <CardTitle>{t("aiAssistant")}</CardTitle>
                <CardDescription>{t("aiAssistantDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild variant="secondary">
                    <Link href="/admin/dashboard/ai-assistant">{t("aiAssistant")}</Link>
                </Button>
            </CardContent>
          </Card>
          
          <div className="hidden md:block">
            <Card>
                <CardHeader>
                    <CardTitle>Import / Export</CardTitle>
                    <CardDescription>Bulk import or export children's data.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
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
                                <code className="text-xs text-muted-foreground bg-muted p-2 rounded-md break-all block">
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
                    <Button onClick={handleExportCSV} variant="outline" disabled={isLoading}><FileDown className="mr-2 h-4 w-4" />{t('exportChildren')}</Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
