import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { CircleFadingPlus, Check } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { api } from "@packages/backend/convex/_generated/api";

const formSchema = z.object({
  name: z.string().min(1, "Metric name is required"),
  colour: z.string().min(1),
  unit: z.string().optional(),
  increment: z.enum(["1", "0.1", "0.01"]).optional(),
});

type FormSchema = z.output<typeof formSchema>;

const colourOptions = [
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

const incrementOptions = [
  {
    value: "1",
    label: "Whole numbers",
    description: "1, 2, 3, 4...",
  },
  {
    value: "0.1",
    label: "One decimal place",
    description: "1.0, 1.1, 1.2...",
  },
  {
    value: "0.01",
    label: "Two decimal places",
    description: "1.00, 1.01, 1.02...",
  },
];

const getRandomColour = () =>
  colourOptions[Math.floor(Math.random() * colourOptions.length)];

export default function CreateNewMetricDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  const viewer = useQuery(api.auth.viewer);

  const hasAccess = useMemo(() => {
    return viewer?.isSubscribed || viewer?.hasLifetimeAccess;
  }, [viewer]);


  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      colour: getRandomColour(),
      unit: "",
      increment: "1",
    },
  });

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      form.reset({
        name: "",
        colour: getRandomColour(),
        unit: "",
        increment: "1",
      });
    }
  };

  const dialogColour = useMemo(() => {
    return color(form.watch("colour")).mix(color("white"), 0.6).hex();
  }, [form.watch("colour")]);

  const createMetric = useMutation(
    api.userMetrics.mutations.createNewUserMetric,
  );

  const handleSubmitCreateNewMetric = async (data: FormSchema) => {
    try {
      const rawIncrement = data.increment ? parseFloat(data.increment) : 1;
      const valueType: "integer" | "float" =
        rawIncrement % 1 !== 0 ? "float" : "integer";

      await createMetric({
        name: data.name,
        colour: data.colour,
        unit: data.unit || undefined,
        increment: data.increment ? parseFloat(data.increment) : undefined,
        valueType: valueType,
      });

      setDialogOpen(false);
    } catch (err) {
      handleHookMutationError(err);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"} disabled={!hasAccess}>
          <CircleFadingPlus />
        </Button>
      </DialogTrigger>

      <DialogContent
        style={{
          backgroundImage: `linear-gradient(180deg, ${dialogColour}, white)`,
        }}
        className="max-w-md"
      >
        <DialogHeader>
          <DialogTitle>Create a new metric</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600 mb-2">
          Use this form to create a new metric you want to track daily.
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmitCreateNewMetric)}
            className="space-y-4"
          >
            {/* Name */}
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
                      placeholder="e.g. Weight, Focus Hours"
                      className="border-black rounded-sm text-sm bg-white"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Unit */}
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Unit</Label>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="e.g. kg, hours, words"
                      className="border-black rounded-sm text-sm bg-white"
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Number Precision */}
            <FormField
              control={form.control}
              name="increment"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Number precision</Label>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-black rounded-sm text-sm bg-white">
                        <SelectValue placeholder="Select precision" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {incrementOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-500">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    How precise should your measurements be?
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Colour */}
            <FormField
              control={form.control}
              name="colour"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Colour*</FormLabel>
                  <div className="flex flex-row gap-2 flex-wrap">
                    {colourOptions.map((metricColour) => {
                      return (
                        <div
                          key={metricColour}
                          className={cn(
                            "h-10 w-10 rounded-md border cursor-pointer hover:scale-110 transition-transform",
                            {
                              "border-gray-900 border-2":
                                metricColour === form.getValues("colour"),
                              "border-gray-300":
                                metricColour !== form.getValues("colour"),
                            },
                          )}
                          style={{
                            backgroundColor: metricColour,
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            form.setValue("colour", metricColour);
                          }}
                        />
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className={cn("w-full")}
              disabled={form.formState.isSubmitting}
            >
              <CircleFadingPlus />
              {form.formState.isSubmitting ? "Creating..." : "Create metric"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
