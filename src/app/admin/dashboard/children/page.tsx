
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

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);

  const loadChildren = useCallback(() => {
    let storedChildren: Child[];
    try {
      const storedChildrenJSON = localStorage.getItem("registeredChildren");
      if (storedChildrenJSON) {
        storedChildren = JSON.parse(storedChildrenJSON);
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

    // Add event listener to reload data when the window (or tab) gets focus.
    // This ensures the list is fresh when navigating back to this page.
    window.addEventListener('focus', loadChildren);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('focus', loadChildren);
    };
  }, [loadChildren]);

  return (
    <div className="py-6">
      <h2 className="text-3xl font-bold tracking-tight mb-4">
        Registered Children
      </h2>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Photo</TableHead>
              <TableHead>Profile No.</TableHead>
              <TableHead>Child's Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Parent's Name</TableHead>
              <TableHead>Parent Email</TableHead>
              <TableHead>Parent Phone</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
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
