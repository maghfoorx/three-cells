import { useEffect } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router";

const RedirectToToday = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const formattedDate = format(new Date(), "yyyy-MM-dd");
    navigate(`/track/${formattedDate}`, { replace: true });
  }, [navigate]);

  return null;
};

export default RedirectToToday;
