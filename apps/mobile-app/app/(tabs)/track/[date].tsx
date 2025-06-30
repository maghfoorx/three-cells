import { SafeAreaView, ScrollView, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { parse, format, isValid } from "date-fns";
import ThreeCellDailyForm from "@/components/ThreeCellDailyForm";

export default function TrackPage() {
  const { date } = useLocalSearchParams();

  console.log(date, "TRACK_DATE");

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

  console.log(parsedDate, "IS_PARSED_DATE");

  return <ThreeCellDailyForm date={parsedDate} />;
}
