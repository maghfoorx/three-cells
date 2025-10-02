import { useLocalSearchParams } from "expo-router";
import { parse, isValid } from "date-fns";
import ThreeCellDailyForm from "@/components/ThreeCellDailyFormMobile";
import React from "react";
import { useNewDay } from "@/hooks/useNewDay";

export default function TrackPage() {
  const today = useNewDay();
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

  return (
    <React.Fragment key={today.toISOString()}>
      <ThreeCellDailyForm date={parsedDate} />
    </React.Fragment>
  );
}
