
export interface Child {
  id: string;
  name: string;
  age: number;
  parent: string;
  parentEmail: string;
  parentPhone: string;
  photo: string;
}

export const initialChildren: Child[] = [
  {
    id: "BP001",
    name: "Olivia Smith",
    age: 4,
    parent: "John Smith",
    parentEmail: "john@example.com",
    parentPhone: "111-222-3333",
    photo: "https://placehold.co/100x100.png",
  },
  {
    id: "BP002",
    name: "Noah Johnson",
    age: 5,
    parent: "Emily Johnson",
    parentEmail: "emily@example.com",
    parentPhone: "222-333-4444",
    photo: "https://placehold.co/100x100.png",
  },
  {
    id: "BP003",
    name: "Emma Williams",
    age: 3,
    parent: "Michael Williams",
    parentEmail: "michael@example.com",
    parentPhone: "333-444-5555",
    photo: "https://placehold.co/100x100.png",
  },
  {
    id: "BP004",
    name: "Liam Brown",
    age: 4,
    parent: "Sophia Brown",
    parentEmail: "sophia@example.com",
    parentPhone: "444-555-6666",
    photo: "https://placehold.co/100x100.png",
  },
  {
    id: "BP005",
    name: "Ava Jones",
    age: 5,
    parent: "David Jones",
    parentEmail: "david@example.com",
    parentPhone: "555-666-7777",
    photo: "https://placehold.co/100x100.png",
  },
];
