
export interface Child {
  id: string;
  name: string;
  age: number;
  parent: string;
  contact: string;
  photo: string;
}

export const initialChildren: Child[] = [
  {
    id: "BP001",
    name: "Olivia Smith",
    age: 4,
    parent: "John Smith",
    contact: "john@example.com",
    photo: "",
  },
  {
    id: "BP002",
    name: "Noah Johnson",
    age: 5,
    parent: "Emily Johnson",
    contact: "emily@example.com",
    photo: "",
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
    photo: "",
  },
  {
    id: "BP005",
    name: "Ava Jones",
    age: 5,
    parent: "David Jones",
    contact: "david@example.com",
    photo: "",
  },
];
