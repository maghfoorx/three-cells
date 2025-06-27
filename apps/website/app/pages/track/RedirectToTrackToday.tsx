import { format } from "date-fns";
import { Navigate } from "react-router";

const RedirectToToday = () => {
  const today = format(new Date(), "yyyy-MM-dd");
  return <Navigate to={`/track/${today}`} />;
};

export default RedirectToToday;
