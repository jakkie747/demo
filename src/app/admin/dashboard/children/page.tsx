
"use client";

import { useState, useEffect } from "react";
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

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const fetchedChildren = await getChildren();
        setChildren(fetchedChildren);
      } catch (error) {
        console.error("Failed to load children from Firestore", error);
        // Optionally, show a toast message to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

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
              <TableHead>{t('age')}</TableHead>
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
                      <AvatarImage src={child.photo} alt={child.name} unoptimized/>
                      <AvatarFallback>
                        {child.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{child.id.substring(0, 8)}...</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{child.name}</TableCell>
                  <TableCell>{child.age}</TableCell>
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
