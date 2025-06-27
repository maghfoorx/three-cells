import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { Check, ChevronsUpDown, CircleFadingPlus } from "lucide-react";
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
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ConvexError } from "convex/values";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { api } from "@packages/backend/convex/_generated/api";

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1),
});

type FormSchema = z.output<typeof formSchema>;

export default function CreateNewHabitDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",

      colour: getRandomColourForNewHabit(),
    },
  });

  const viewer = useQuery(api.auth.viewer);

  const hasLifeTimeAccess =
    (viewer != null &&
      viewer.hasActivePurchase != null &&
      viewer.hasActivePurchase) ??
    false;

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    form.reset({
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
    });
  };

  const dialogColour = useMemo(() => {
    return color(form.watch("colour")).mix(color("white"), 0.6).hex();
  }, [form.watch("colour")]);

  const createHabit = useMutation(api.habits.createNewUserHabit);

  const handleSubmitCreateNewHabit = async (data: FormSchema) => {
    try {
      await createHabit({
        name: data.name,
        colour: data.colour,
        habitQuestion: data.habitQuestion,
      });
      setDialogOpen(false);
    } catch (err) {
      handleHookMutationError(err);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"} disabled={!hasLifeTimeAccess}>
          <CircleFadingPlus />
        </Button>
      </DialogTrigger>

      <DialogContent
        style={{
          backgroundImage: `linear-gradient(180deg, ${dialogColour}, white)`,
        }}
      >
        <DialogHeader>
          <DialogTitle>Create a new habit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitCreateNewHabit)}
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
                        ></div>
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

            <div className="flex flex-col gap-2">
              <div className="font-semibold">Habit type*</div>
              <div className="bg-gray-100 border-2 border-gray-600 rounded-sm px-2 py-1">
                <div>Yes or No</div>
                <div className="text-xs text-gray-600">
                  e.g. Did you workout today? Did you wake up early?
                </div>
              </div>
              <div className="text-xs">More types coming soon...</div>
            </div>

            {/* <div>
              {Object.entries(form.formState.errors).map(([field, error]) => (
                <p key={field} className="text-red-500">
                  {field}: {error?.message?.toString()}
                </p>
              ))}
            </div> */}

            <Button type="submit" className={cn("w-full")} disabled={false}>
              <CircleFadingPlus /> Create habit
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
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
