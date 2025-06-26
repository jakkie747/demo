
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Baby, Home, User, Mail, Phone, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { initialChildren, type Child } from "@/lib/data";

const formSchema = z.object({
  childName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  childAge: z.coerce
    .number()
    .min(1, "Age must be at least 1")
    .max(6, "Age must be at most 6"),
  childGender: z.enum(["male", "female", "other"]),
  address: z.string().min(10, "Please enter a valid address"),
  parentName: z.string().min(2, "Name is too short").max(50, "Name is too long"),
  parentEmail: z.string().email("Invalid email address"),
  parentPhone: z.string().min(10, "Please enter a valid phone number"),
  childPhoto: z.any().optional(),
});

export default function RegisterPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      childName: "",
      childAge: "" as any,
      address: "",
      parentName: "",
      parentEmail: "",
      parentPhone: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const file = values.childPhoto?.[0];
    let photoDataUrl = "";

    if (file) {
      try {
        photoDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          variant: "destructive",
          title: "File Upload Error",
          description: "Could not read the uploaded photo.",
        });
        return;
      }
    }

    try {
      const storedChildrenJSON = localStorage.getItem("registeredChildren");
      const existingChildren: Child[] = storedChildrenJSON
        ? JSON.parse(storedChildrenJSON)
        : initialChildren;

      const nextIdNumber = existingChildren.length + 1;
      const nextId = `BP${String(nextIdNumber).padStart(3, "0")}`;

      const newChild: Child = {
        id: nextId,
        name: values.childName,
        age: values.childAge,
        parent: values.parentName,
        contact: values.parentEmail,
        photo: photoDataUrl,
      };

      const updatedChildren = [...existingChildren, newChild];
      localStorage.setItem(
        "registeredChildren",
        JSON.stringify(updatedChildren)
      );

      toast({
        title: "Registration Submitted!",
        description: `Thank you for registering ${values.childName}. We will be in touch shortly.`,
      });
      form.reset();
    } catch (error) {
      console.error("Failed to save registration:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem saving the registration.",
      });
    }
  }

  return (
    <div className="container py-12 md:py-24">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">
            Register Your Child
          </CardTitle>
          <CardDescription>
            Fill out the form below to enroll your child at Blinkogies. We can't
            wait to meet them!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <h3 className="text-xl font-headline text-primary/80">
                Child's Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="childName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Baby className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            placeholder="e.g. Jane Doe"
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="childAge"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 3"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="childGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="childPhoto"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Child's Photo</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="file"
                          {...rest}
                          onChange={(event) => {
                            onChange(event.target.files);
                          }}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      An optional photo of your child for their profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="text-xl font-headline text-primary/80 pt-4">
                Parent/Guardian Information
              </h3>
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          placeholder="e.g. John Smith"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="parentEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="e.g. john.smith@example.com"
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="tel"
                            placeholder="e.g. (123) 456-7890"
                            {...field}
                            className="pl-10"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Textarea
                          placeholder="123 Main St, Anytown, USA"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full font-semibold">
                Register Child
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
