import { zodResolver } from "@hookform/resolvers/zod";
import color from "color";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "~/components/ui/textarea";
import { cn } from "~/lib/utils";
import { useEffect, useMemo } from "react";
import { useMutation } from "convex/react";
import { handleHookMutationError } from "~/lib/handleHookMutationError";
import { api } from "@packages/backend/convex/_generated/api";
import { useSnapshot } from "valtio";
import type { Doc } from "@packages/backend/convex/_generated/dataModel";
import { proxy } from "valtio";
import { Plus } from "lucide-react";

// Valtio state
export const addMetricEntryDialogState = proxy({
  metric: null as Doc<"userMetrics"> | null,
  latestEntry: null as Doc<"userMetricSubmissions"> | null,
});

// Helper to open the dialog
export const openAddMetricEntryDialog = (
  metric: Doc<"userMetrics">,
  latestEntry?: Doc<"userMetricSubmissions"> | null,
) => {
  addMetricEntryDialogState.metric = metric;
  addMetricEntryDialogState.latestEntry = latestEntry || null;
};

// Helper to close the dialog
export const closeAddMetricEntryDialog = () => {
  addMetricEntryDialogState.metric = null;
  addMetricEntryDialogState.latestEntry = null;
};

const formSchema = z.object({
  value: z.string().min(1, "Value is required"),
  dateFor: z.string().min(1, "Date is required"),
  note: z.string().optional(),
});

type FormSchema = z.output<typeof formSchema>;

export default function AddMetricEntryDialog() {
  const snap = useSnapshot(addMetricEntryDialogState);
  const metric = snap.metric;
  const latestEntry = snap.latestEntry;

  const isOpen = metric !== null;

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: latestEntry?.value.toString() || "",
      dateFor: getTodayDateString(),
      note: "",
    },
  });

  useEffect(() => {
    if (metric && latestEntry) {
      form.reset({
        value: latestEntry.value.toString(),
        // dateFor: latestEntry.dateFor,
        note: latestEntry.note || "",
      });
    }
  }, [metric, latestEntry]);

  const dialogColour = useMemo(() => {
    if (!metric) return "#ffffff";
    return color(metric.colour).mix(color("white"), 0.8).hex();
  }, [metric?.colour]);

  const createMetricEntry = useMutation(
    api.userMetrics.mutations.createMetricEntry,
  );

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      closeAddMetricEntryDialog();
      form.reset({
        value: "",
        dateFor: getTodayDateString(),
        note: "",
      });
    }
  };

  const handleSubmit = async (data: FormSchema) => {
    if (!metric) return;

    try {
      const parsedValue = parseFloat(data.value);

      if (isNaN(parsedValue)) {
        form.setError("value", { message: "Please enter a valid number" });
        return;
      }

      await createMetricEntry({
        metricId: metric._id,
        value: parsedValue,
        dateFor: data.dateFor,
        note: data.note || undefined,
      });

      closeAddMetricEntryDialog();
      form.reset({
        value: "",
        dateFor: getTodayDateString(),
        note: "",
      });
    } catch (err) {
      handleHookMutationError(err);
    }
  };

  // Get step value based on increment
  const getStepValue = () => {
    if (!metric?.increment) return "1";
    return metric.increment.toString();
  };

  // Format placeholder based on increment
  const getValuePlaceholder = () => {
    if (!metric) return "Enter value";

    if (metric.increment === 0.01) return "e.g. 75.25";
    if (metric.increment === 0.1) return "e.g. 75.5";
    return "e.g. 75";
  };

  if (!metric) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        style={{
          backgroundColor: dialogColour,
        }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metric.colour }}
            />
            Add entry for {metric.name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* Value Input */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>
                    Value* {metric.unit && `(${metric.unit})`}
                  </Label>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      step={getStepValue()}
                      placeholder={getValuePlaceholder()}
                      className="border-black rounded-sm text-sm bg-white"
                      autoComplete="off"
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Show latest entry if available */}
            {latestEntry && (
              <div className="text-xs text-gray-600 bg-white/50 p-2 rounded-sm">
                Last entry:{" "}
                <span className="font-medium">{latestEntry.value}</span>
                {metric.unit && ` ${metric.unit}`} on{" "}
                {new Date(latestEntry.dateFor).toLocaleDateString()}
              </div>
            )}

            {/* Date Input */}
            <FormField
              control={form.control}
              name="dateFor"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Date*</Label>
                  <FormControl>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      max={getTodayDateString()}
                      className="border-black rounded-sm text-sm bg-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Note Input (Optional) */}
            {/*<FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor={field.name}>Note (optional)</Label>
                  <FormControl>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Add any additional notes..."
                      className="border-black rounded-sm text-sm bg-white resize-none"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
*/}
            <Button
              type="submit"
              className={cn("w-full")}
              disabled={form.formState.isSubmitting}
              style={{
                backgroundColor: metric.colour,
              }}
            >
              <Plus size={16} />
              {form.formState.isSubmitting ? "Adding..." : "Add entry"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
