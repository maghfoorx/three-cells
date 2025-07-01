import { SafeAreaView, ScrollView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { parse, format, isValid } from "date-fns";
import ThreeCellDailyForm from "@/components/ThreeCellDailyFormMobile";

export default function TrackPage() {
  const { date } = useLocalSearchParams();

  // Handle the date parsing more safely
  let parsedDate: Date;

  if (typeof date === "string") {
    parsedDate = parse(date, "yyyy-MM-dd", new Date());
  } else {
    parsedDate = new Date(); // fallback to today
  }

  // If parsing failed, fallback to today
  if (!isValid(parsedDate)) {
    parsedDate = new Date();
  }

  return <ThreeCellDailyForm date={parsedDate} />;
}
