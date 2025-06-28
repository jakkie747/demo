
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { getChildren } from "@/services/childrenService";
import type { Child } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { isFirebaseConfigured } from "@/lib/firebase";
import { AlertTriangle } from "lucide-react";

const ChildAge = ({ dobString }: { dobString: string }) => {
  const [age, setAge] = useState<number | string>('');

  useEffect(() => {
    if (!dobString || isNaN(new Date(dobString).getTime())) {
      setAge("N/A");
      return;
    }
    // This logic is now safe inside useEffect, as it only runs on the client
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

  const fetchChildren = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedChildren = await getChildren();
      setChildren(fetchedChildren);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Could not fetch children." });
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
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        {t('registeredChildrenTitle')}
      </h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('photo')}</TableHead>
              <TableHead>{t('profileNo')}</TableHead>
              <TableHead>{t('childsName')}</TableHead>
              <TableHead>{t('ageInTable')}</TableHead>
              <TableHead>{t('parentsName')}</TableHead>
              <TableHead>{t('parentEmail')}</TableHead>
              <TableHead>{t('parentPhone')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                   <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : children.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
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
                  <TableCell>
                    <Badge variant="outline">{child.id.substring(0, 8)}...</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{child.name}</TableCell>
                  <TableCell>
                    {child.dateOfBirth ? <ChildAge dobString={child.dateOfBirth} /> : (child as any).age || "N/A"}
                  </TableCell>
                  <TableCell>{child.parent}</TableCell>
                  <TableCell>{child.parentEmail}</TableCell>
                  <TableCell>{child.parentPhone}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
