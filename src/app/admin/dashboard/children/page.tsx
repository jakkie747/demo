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

const children = [
  {
    id: "BP001",
    name: "Olivia Smith",
    age: 4,
    parent: "John Smith",
    contact: "john@example.com",
    photo: "/avatars/01.png",
  },
  {
    id: "BP002",
    name: "Noah Johnson",
    age: 5,
    parent: "Emily Johnson",
    contact: "emily@example.com",
    photo: "/avatars/02.png",
  },
  {
    id: "BP003",
    name: "Emma Williams",
    age: 3,
    parent: "Michael Williams",
    contact: "michael@example.com",
    photo: "",
  },
  {
    id: "BP004",
    name: "Liam Brown",
    age: 4,
    parent: "Sophia Brown",
    contact: "sophia@example.com",
    photo: "/avatars/03.png",
  },
  {
    id: "BP005",
    name: "Ava Jones",
    age: 5,
    parent: "David Jones",
    contact: "david@example.com",
    photo: "/avatars/04.png",
  },
];

export default function ChildrenPage() {
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
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child) => (
              <TableRow key={child.id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage
                      src={`https://placehold.co/40x40.png?text=${child.name
                        .charAt(0)
                        .toUpperCase()}`}
                      alt={child.name}
                    />
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
                <TableCell>{child.contact}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
