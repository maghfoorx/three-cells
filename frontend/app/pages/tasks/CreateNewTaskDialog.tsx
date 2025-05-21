import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClipboardPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { showErrorToast } from "~/lib/showErrorToast";
import { showSuccessToast } from "~/lib/showSuccessToast";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function CreateNewTaskDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: undefined,
      category_id: undefined,
    },
  });

  const createNewTask = useMutation(api.tasks.createUserTask);

  const handleCreateNewTask = async (data: FormSchema) => {
    try {
      await createNewTask({
        title: data.title,
        description: data.description,
        category_id: data.category_id as any,
      });

      form.reset();
      setDialogOpen(false);
    } catch (error) {}
  };

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // handle form submission
      if (
        event.key === "Enter" &&
        event.shiftKey &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        form.handleSubmit(handleCreateNewTask)();
      }

      // open a new not
      if (event.key === "N" && event.shiftKey) {
        event.preventDefault();
        if (dialogOpen === false) {
          setDialogOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    form.reset();
  };
  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"} onClick={() => setDialogOpen(true)}>
          <ClipboardPlus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <div className="space-y-1">
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Use this form to create a new task
          </DialogDescription>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateNewTask)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Task*</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="What's there to do?"
                      className="h-20"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Description</Label>
                  <FormControl>
                    <Textarea
                      id={field.name}
                      {...field}
                      placeholder="Any extra info..."
                      className="h-40"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Category</Label>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="What category?"
                      className=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            /> */}
            <Button
              type="submit"
              className={cn("w-full")}
              disabled={form.formState.isSubmitting}
            >
              <ClipboardPlus /> Add task
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
