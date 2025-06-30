import { format } from "date-fns";
import { Redirect } from "expo-router";

export default function TrackRedirect() {
  const today = format(new Date(), "yyyy-MM-dd");
  return <Redirect href={`/track/${today}`} />;
}
