import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AppState } from "react-native";

const NewDayContext = createContext<Date>(new Date());

export function NewDayProvider({ children }: { children: React.ReactNode }) {
  const [today, setToday] = useState(() => new Date());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null | number>(null);

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

    // Modern AppState subscription with debouncing
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        // Clear any existing debounce timeout
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        // Debounce the state update to prevent rapid flickering
        debounceTimeoutRef.current = setTimeout(() => {
          const now = new Date();
          const currentDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          setToday((prevToday) => {
            const prevDay = new Date(
              prevToday.getFullYear(),
              prevToday.getMonth(),
              prevToday.getDate(),
            );

            // Only update if the day actually changed
            if (currentDay.getTime() !== prevDay.getTime()) {
              return now;
            }
            return prevToday;
          });
        }, 100); // 100ms debounce
      }
    });

    return () => {
      clearTimeout(timer); // clear the midnight timer
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
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
