import { createContext, useContext, useEffect, useState } from "react";
import { AppState } from "react-native";

const NewDayContext = createContext<Date>(new Date());

export function NewDayProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState(() => new Date());

  useEffect(() => {
    let timer: number;

    const scheduleNextMidnight = () => {
      const now = new Date();
      const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        0,
      );
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();

      timer = setTimeout(() => {
        setToday(new Date());
        scheduleNextMidnight(); // Schedule the next midnight
      }, msUntilMidnight);
    };

    scheduleNextMidnight();

    // Modern AppState subscription
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setToday(new Date());
      }
    });

    return () => {
      clearTimeout(timer); // clear the midnight timer
      subscription.remove(); // remove AppState listener
    };
  }, []);

  return (
    <NewDayContext.Provider value={today}>{children}</NewDayContext.Provider>
  );
}

export function useNewDay() {
  return useContext(NewDayContext);
}
