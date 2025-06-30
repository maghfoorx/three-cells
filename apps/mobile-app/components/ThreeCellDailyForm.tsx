import { useForm, Controller } from "react-hook-form";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useEffect } from "react";
import { format, parse } from "date-fns";

const formSchema = z.object({
  summary: z.string().min(1, "Summary is required"),
  focused_hours: z.number().min(0).max(24),
  score: z.number().min(-2).max(2),
  date_for: z.date(),
});

const MOOD_OPTIONS = [
  { value: -2, emoji: "😭", color: "#FF6B6B", label: "Terrible" },
  { value: -1, emoji: "😞", color: "#FFA07A", label: "Bad" },
  { value: 0, emoji: "😐", color: "#FFD93D", label: "Okay" },
  { value: 1, emoji: "😊", color: "#6BCF7F", label: "Good" },
  { value: 2, emoji: "😁", color: "#4ECDC4", label: "Amazing" },
];

export default function ThreeCellDailyForm({ date }: { date: Date }) {
  // The date is already a Date object, so use it directly
  const parsedDate = date;

  const data = useQuery(api.threeCells.threeCellForDate, {
    date: format(parsedDate, "yyyy-MM-dd"),
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      summary: "",
      focused_hours: 0,
      score: 0,
      date_for: parsedDate,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        summary: data.summary,
        focused_hours: data.focusedHours,
        score: data.score,
        date_for: parse(data.dateFor, "yyyy-MM-dd", new Date()),
      });
    } else {
      reset({
        summary: "",
        focused_hours: 0,
        score: 0,
        date_for: parsedDate,
      });
    }
  }, [data, reset, parsedDate]);

  const submitThreeCellEntry = useMutation(api.threeCells.submitThreeCellEntry);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Submitting values:", values);
    try {
      await submitThreeCellEntry({
        input: {
          summary: values.summary,
          focused_hours: values.focused_hours,
          score: values.score,
          date_for: format(values.date_for, "yyyy-MM-dd"),
        },
      });
      alert("Entry saved successfully!");
    } catch (e) {
      console.error("Submission error:", e);
      alert("Failed to save entry.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Date Header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateText}>
          {format(parsedDate, "EEEE, MMMM do")}
        </Text>
        <Text style={styles.yearText}>{format(parsedDate, "yyyy")}</Text>
      </View>

      {/* Mood Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How was your day?</Text>
        <Controller
          control={control}
          name="score"
          render={({ field }) => (
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map((mood) => (
                <TouchableOpacity
                  key={mood.value}
                  onPress={() => field.onChange(mood.value)}
                  style={[
                    styles.moodTile,
                    {
                      backgroundColor:
                        field.value === mood.value ? mood.color : "#F8F9FA",
                      borderColor:
                        field.value === mood.value ? mood.color : "#E9ECEF",
                      transform: [
                        { scale: field.value === mood.value ? 1.05 : 1 },
                      ],
                    },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      {
                        color: field.value === mood.value ? "white" : "#6C757D",
                        fontWeight: field.value === mood.value ? "600" : "400",
                      },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Focus Hours */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Focus hours</Text>
        <Controller
          control={control}
          name="focused_hours"
          render={({ field }) => (
            <View style={styles.focusContainer}>
              <TextInput
                keyboardType="numeric"
                value={String(field.value)}
                onChangeText={(text) =>
                  field.onChange(Number.parseFloat(text) || 0)
                }
                style={styles.focusInput}
                placeholder="0"
                placeholderTextColor="#ADB5BD"
              />
              <Text style={styles.focusLabel}>hours of deep work</Text>
            </View>
          )}
        />
      </View>

      {/* Daily Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily reflection</Text>
        <Controller
          control={control}
          name="summary"
          render={({ field }) => (
            <TextInput
              multiline
              placeholder="What happened today? Any wins, challenges, or insights?"
              value={field.value}
              onChangeText={field.onChange}
              style={styles.summaryInput}
              placeholderTextColor="#ADB5BD"
              textAlignVertical="top"
            />
          )}
        />
        {errors.summary && (
          <Text style={styles.errorText}>{errors.summary.message}</Text>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        style={[styles.submitButton, { opacity: isSubmitting ? 0.7 : 1 }]}
      >
        {isSubmitting ? (
          <View style={styles.submitContent}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.submitText}>Saving...</Text>
          </View>
        ) : (
          <Text style={styles.submitText}>Save Entry</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    flex: 1,
  },
  dateHeader: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 16,
  },
  dateText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
    marginBottom: 4,
  },
  yearText: {
    fontSize: 16,
    color: "#6C757D",
    fontWeight: "400",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 16,
  },
  moodContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  moodTile: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 80,
    justifyContent: "center",
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  moodLabel: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  focusContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  focusInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#212529",
    minWidth: 40,
    textAlign: "center",
  },
  focusLabel: {
    fontSize: 16,
    color: "#6C757D",
    marginLeft: 12,
    flex: 1,
  },
  summaryInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#212529",
    minHeight: 120,
    lineHeight: 24,
  },
  errorText: {
    color: "#DC3545",
    fontSize: 14,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
