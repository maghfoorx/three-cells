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
import { gql, useMutation } from "@apollo/client";
import { showErrorToast } from "~/lib/showErrorToast";
import { showSuccessToast } from "~/lib/showSuccessToast";
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category_id: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

const CREATE_NEW_TASK_MUTATION = gql`
  mutation CreateNewTask($input: CreateUserTaskInput!) {
    createUserTask(input: $input) {
      id
      title
      description
      category
    }
  }
`;

export default function CreateNewTaskDialog() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
    },
  });

  const [createNewTask, { loading: createNewTaskSubmitting }] = useMutation(
    CREATE_NEW_TASK_MUTATION,
    {
      refetchQueries: ["AllUserTasks"],
      onError: () => {
        showErrorToast();
      },
      onCompleted: () => {
        showSuccessToast();
      },
    }
  );

  const handleCreateNewTask = async (data: FormSchema) => {
    try {
      await createNewTask({
        variables: {
          input: {
            title: data.title,
            description: data.description,
            category_id: data.category_id,
          },
        },
      });

      form.reset();
      setDialogOpen(false);
    } catch (error) {}
  };

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
        <DialogHeader>
          <DialogTitle>Create a new task</DialogTitle>
        </DialogHeader>
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
              disabled={createNewTaskSubmitting}
            >
              Add task
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
