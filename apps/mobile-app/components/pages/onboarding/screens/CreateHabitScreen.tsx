import { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Vibration,
} from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import clsx from "clsx";
import color from "color";
import OnboardingContainer from "../OnboardingContainer";
import OnboardingButton from "../OnboardingButton";
import ProgressIndicator from "../ProgressIndicator";

const formSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  colour: z.string().min(1),
  habitQuestion: z.string().min(1, "Question is required"),
});

type FormSchema = z.output<typeof formSchema>;

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

interface CreateHabitScreenProps {
  onNext: (habitData: FormSchema) => void;
}

export default function CreateHabitScreen({ onNext }: CreateHabitScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      habitQuestion: "",
      colour: getRandomColourForNewHabit(),
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  const selectedColour = watch("colour");

  const pageColour = useMemo(() => {
    return color(selectedColour).mix(color("white"), 0.85).hex();
  }, [selectedColour]);

  const handleCreateHabit = async (data: FormSchema) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Trigger vibration for success feedback
    Vibration.vibrate([100, 50, 100]);

    setIsSubmitting(false);
    onNext(data);
  };

  return (
    <OnboardingContainer backgroundColor={pageColour}>
      <View className="flex-1 px-6">
        <ProgressIndicator currentStep={7} totalSteps={12} />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gray-900 text-center mb-4">
              Create Your First Habit
            </Text>

            <Text className="text-lg text-gray-600 text-center leading-relaxed">
              Make it specific, make it yours, and most importantly - make it
              small enough that you cannot say no.
            </Text>
          </View>

          <View className="space-y-6">
            {/* Name Field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Habit Name*
              </Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border bg-white border-gray-300 p-4 rounded-xl text-base"
                    placeholder="e.g., Morning meditation, Daily walk, Read 5 pages"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="off"
                  />
                )}
              />
              {errors.name && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </Text>
              )}
            </View>

            {/* Colour Field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Choose a Color*
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {habitsFormColourOptions.map((habitColour) => (
                  <TouchableOpacity
                    key={habitColour}
                    onPress={() => setValue("colour", habitColour)}
                    className={clsx("h-12 w-12 rounded-xl border-3", {
                      "border-gray-900": habitColour === selectedColour,
                      "border-gray-300": habitColour !== selectedColour,
                    })}
                    style={{
                      backgroundColor: habitColour,
                    }}
                  />
                ))}
              </View>
              {errors.colour && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.colour.message}
                </Text>
              )}
            </View>

            {/* Question Field */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Daily Check-in Question*
              </Text>
              <Controller
                control={control}
                name="habitQuestion"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className="border bg-white border-gray-300 rounded-xl p-4 text-base min-h-[100px]"
                    placeholder="e.g., Did I meditate for 5 minutes today? Did I take a 10-minute walk?"
                    multiline
                    textAlignVertical="top"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoComplete="off"
                  />
                )}
              />
              {errors.habitQuestion && (
                <Text className="text-red-500 text-sm mt-1">
                  {errors.habitQuestion.message}
                </Text>
              )}
            </View>

            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <Text className="text-sm text-blue-800 font-medium mb-2">
                💡 Remember
              </Text>
              <Text className="text-sm text-blue-700">
                Start with something so small you cannot fail. You can always
                increase the difficulty once the habit becomes automatic.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View className="pb-8">
          <OnboardingButton
            title={isSubmitting ? "Creating..." : "Create My Habit"}
            onPress={handleSubmit(handleCreateHabit)}
            icon="plus-circle"
            loading={isSubmitting}
          />
        </View>
      </View>
    </OnboardingContainer>
  );
}
