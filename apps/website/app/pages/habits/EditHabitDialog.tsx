import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { CircleFadingPlus, SettingsIcon, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";

// shadcn AlertDialog imports (Radix-based)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { useNavigate } from "react-router";

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1),
});

type FormSchema = z.output<typeof formSchema>;

export default function EditHabitDialog({
  habitId,
}: {
  habitId: Id<"userHabits">;
}) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const singleHabitData = useQuery(api.habits.getSingleHabit, {
    id: habitId,
  });
  const viewer = useQuery(api.auth.viewer);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
    },
  });

  // Reset form when habit data loads
  useEffect(() => {
    if (singleHabitData != null) {
      form.reset({
        name: singleHabitData.name,
        habitQuestion: singleHabitData.habitQuestion,
        colour: singleHabitData.colour,
      });
    }
  }, [singleHabitData, form.reset]);

  const hasAccess = useMemo(() => {
    return viewer?.isSubscribed || viewer?.hasLifetimeAccess;
  }, [viewer]);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);

    if (!open) {
      // clear when closing
      form.reset({
        name: "",
        habitQuestion: "",
        colour: getRandomColourForNewHabit(),
      });
      return;
    }

    // when opening, if we already have fetched data, populate the form with it
    if (singleHabitData) {
      form.reset({
        name: singleHabitData.name,
        habitQuestion: singleHabitData.habitQuestion,
        colour: singleHabitData.colour,
      });
    } else {
      // otherwise keep current values (or set defaults)
      form.reset({
        name: "",
        habitQuestion: "",
        colour: getRandomColourForNewHabit(),
      });
    }
  };

  const dialogColour = useMemo(() => {
    const c = form.watch("colour");
    return color(c).mix(color("white"), 0.6).hex();
  }, [form.watch("colour")]);

  const updateHabit = useMutation(api.habits.updateHabit);
  const handleUpdateHabit = async (data: FormSchema) => {
    try {
      await updateHabit({
        habitId: habitId,
        name: data.name,
        colour: data.colour,
        habitQuestion: data.habitQuestion,
      });
      handleDialogOpenChange(false);
      // close dialog after update if you want:
      // setDialogOpen(false);
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const deleteHabit = useMutation(api.habits.deleteHabit);
  const handleConfirmDelete = async () => {
    try {
      // call the delete mutation
      handleDialogOpenChange(false);
      navigate("/habits");
      await deleteHabit({ habitId });
      // close the confirm then the edit dialog
      setConfirmOpen(false);
      setDialogOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      handleHookMutationError(err); // optional
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild>
          <Button variant={"outline"} disabled={!hasAccess}>
            <SettingsIcon />
          </Button>
        </DialogTrigger>

        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{
            backgroundImage: `linear-gradient(180deg, ${dialogColour}, white)`,
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateHabit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Name*</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="Workout"
                        className="border-black rounded-sm text-sm bg-white"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colour"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Colour*</FormLabel>
                    <div className="flex flex-row gap-2 flex-wrap">
                      {habitsFormColourOptions.map((habitColour) => {
                        return (
                          <div
                            key={habitColour}
                            className={cn(
                              "h-6 w-6 rounded-sm border border-gray-50",
                              {
                                "border-black border-2":
                                  habitColour === form.getValues("colour"),
                              },
                            )}
                            style={{
                              backgroundColor: habitColour,
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              form.setValue("colour", habitColour);
                            }}
                          />
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="habitQuestion"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor={field.name}>Question*</Label>
                    <FormControl>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="e.g. Did you workout today?"
                        className="border-black rounded-sm text-sm bg-white"
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className={cn("w-full")} disabled={false}>
                Update
              </Button>
            </form>
          </Form>

          {/* Delete button triggers the AlertDialog below */}
          <div className="mt-3">
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"destructive"}
                  className={cn("w-full")}
                  disabled={false}
                  // this button opens the confirmation dialog
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete habit
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete habit</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this habit? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const habitsFormColourOptions = [
  "#FF8A8A",
  "#FFB974",
  "#F49FB6",
  "#FFF176",
  "#7BE495",
  "#B8FF66",
  "#8CFAC0",
  "#72D1F4",
  "#70D6FF",
  "#90BFFF",
  "#D59BF6",
  "#B980F0",
  "#F6A9FF",
];

const getRandomColourForNewHabit = () => {
  return habitsFormColourOptions[
    Math.floor(Math.random() * habitsFormColourOptions.length)
  ];
};
