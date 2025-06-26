
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
import type { Child } from "@/lib/data";
import { initialChildren } from "@/lib/data";
import { useLanguage } from "@/context/LanguageContext";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const { t } = useLanguage();

  const loadChildren = useCallback(() => {
    let storedChildren: Child[];
    try {
      const storedChildrenJSON = localStorage.getItem("registeredChildren");
      if (storedChildrenJSON) {
        const parsedChildren: Child[] = JSON.parse(storedChildrenJSON);
        if (parsedChildren.length > 0 && parsedChildren[0].parentEmail === undefined) {
          storedChildren = initialChildren;
          localStorage.setItem("registeredChildren", JSON.stringify(initialChildren));
        } else {
          storedChildren = parsedChildren;
        }
      } else {
        storedChildren = initialChildren;
        localStorage.setItem(
          "registeredChildren",
          JSON.stringify(initialChildren)
        );
      }
    } catch (error) {
      console.error("Failed to load children from local storage", error);
      storedChildren = initialChildren;
    }
    setChildren(storedChildren);
  }, []);

  useEffect(() => {
    loadChildren();
    window.addEventListener('focus', loadChildren);
    return () => {
      window.removeEventListener('focus', loadChildren);
    };
  }, [loadChildren]);

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
            {children.map((child) => (
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
                  <Badge variant="outline">{child.id}</Badge>
                </TableCell>
                <TableCell className="font-medium">{child.name}</TableCell>
                <TableCell>{child.age}</TableCell>
                <TableCell>{child.parent}</TableCell>
                <TableCell>{child.parentEmail}</TableCell>
                <TableCell>{child.parentPhone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
