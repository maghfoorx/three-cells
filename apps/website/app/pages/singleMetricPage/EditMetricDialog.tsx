import type { Id } from "@packages/backend/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { SettingsIcon, Trash2 } from "lucide-react";
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
import { api } from "@packages/backend/convex/_generated/api";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
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
  name: z.string().min(1, "Metric name is required"),
  colour: z.string().min(1),
  unit: z.string().optional(),
  increment: z.enum(["1", "0.1", "0.01"]).optional(),
});

type FormSchema = z.output<typeof formSchema>;

export const metricsFormColourOptions = [
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
  { value: "1", label: "Whole numbers", description: "1, 2, 3..." },
  { value: "0.1", label: "One decimal place", description: "1.0, 1.1..." },
  { value: "0.01", label: "Two decimal places", description: "1.00, 1.01..." },
];

const getRandomColourForNewMetric = () =>
  metricsFormColourOptions[
    Math.floor(Math.random() * metricsFormColourOptions.length)
  ];

export default function EditMetricDialog({
  metricId,
}: {
  metricId: Id<"userMetrics">;
}) {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const singleMetricData = useQuery(api.userMetrics.queries.getSingleMetric, {
    id: metricId,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      unit: "",
      increment: "1",
      colour: getRandomColourForNewMetric(),
    },
  });

  const { reset, watch, setValue } = form;

  useEffect(() => {
    if (singleMetricData) {
      // convert increment number to string
      let incrementValue: "1" | "0.1" | "0.01" = "1";
      if (singleMetricData.increment !== undefined) {
        if (singleMetricData.increment === 1) incrementValue = "1";
        else if (singleMetricData.increment === 0.1) incrementValue = "0.1";
        else if (singleMetricData.increment === 0.01) incrementValue = "0.01";
        else incrementValue = singleMetricData.increment.toString() as any;
      }

      reset({
        name: singleMetricData.name,
        unit: singleMetricData.unit || "",
        increment: incrementValue,
        colour: singleMetricData.colour,
      });
    }
  }, [singleMetricData, reset]);

  const dialogColour = useMemo(() => {
    const c = watch("colour");
    try {
      return color(c).mix(color("white"), 0.8).hex();
    } catch (e) {
      return "#ffffff";
    }
  }, [watch("colour")]);

  const updateMetric = useMutation(api.userMetrics.mutations.updateMetric);
  const deleteMetric = useMutation(api.userMetrics.mutations.deleteMetric);

  const handleUpdateMetric = async (data: FormSchema) => {
    try {
      const rawIncrement = data.increment
        ? parseFloat(data.increment)
        : undefined;
      const valueType: "integer" | "float" | undefined =
        rawIncrement !== undefined
          ? rawIncrement % 1 !== 0
            ? "float"
            : "integer"
          : undefined;

      await updateMetric({
        metricId: metricId,
        name: data.name,
        colour: data.colour,
        unit: data.unit || undefined,
        increment: rawIncrement,
        valueType,
      });

      setDialogOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      handleHookMutationError(err as any);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setConfirmOpen(false);
      setDialogOpen(false);
      navigate("/metrics");
      await deleteMetric({ metricId });
    } catch (err) {
      console.error("Delete error:", err);
      handleHookMutationError(err);
    }
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
        <DialogTrigger asChild>
          <Button variant={"outline"}>
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
            <DialogTitle>Edit metric</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleUpdateMetric)}
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
                        placeholder="e.g. Weight, Focus Hours"
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
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
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

              <FormField
                control={form.control}
                name="increment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number precision</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        id={field.name}
                        className="border-black rounded-sm text-sm bg-white p-2"
                      >
                        {incrementOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
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
                      {metricsFormColourOptions.map((metricColour) => (
                        <div
                          key={metricColour}
                          className={cn(
                            "h-6 w-6 rounded-sm border border-gray-50 cursor-pointer",
                            {
                              "border-black border-2":
                                metricColour === form.getValues("colour"),
                            },
                          )}
                          style={{ backgroundColor: metricColour }}
                          onClick={(e) => {
                            e.preventDefault();
                            setValue("colour", metricColour);
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className={cn("w-full")}>
                Update
              </Button>
            </form>
          </Form>

          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <Button variant={"destructive"} className={cn("w-full")}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete metric
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete metric</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this metric? This will also
                  delete all associated data entries. This action cannot be
                  undone.
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
        </DialogContent>
      </Dialog>
    </>
  );
}
