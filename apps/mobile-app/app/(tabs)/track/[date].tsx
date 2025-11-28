import { useLocalSearchParams } from "expo-router";
import { parse, isValid, format } from "date-fns";
import ThreeCellDailyForm from "@/components/ThreeCellDailyFormMobile";
import React from "react";
import { useNewDay } from "@/hooks/useNewDay";

export default function TrackPage() {
  const today = useNewDay();
  const { date } = useLocalSearchParams();

  let dateString: string;

  if (typeof date === "string") {
    // Validate the string strictly
    const parsed = parse(date, "yyyy-MM-dd", new Date());
    if (isValid(parsed)) {
      dateString = date;
    } else {
      dateString = format(new Date(), "yyyy-MM-dd");
    }
  } else {
    dateString = format(new Date(), "yyyy-MM-dd");
  }

  return (
    <React.Fragment key={today.toISOString()}>
      {/* 2. Pass the STRING, not the Date object */}
      <ThreeCellDailyForm date={dateString} />
    </React.Fragment>
  );
}
