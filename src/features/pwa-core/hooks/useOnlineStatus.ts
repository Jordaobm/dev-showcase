import { useEffect, useState } from "react";

interface OnlineStatusState {
  isOnline: boolean;
  timeOffline: number;
  timeOnline: number;
}

export const useOnlineStatus = (): OnlineStatusState => {
  const [isOnline, setIsOnline] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    const checkStatus = async () => {
      try {
        const response = await fetch("/api/health", {
          method: "HEAD",
          cache: "no-store",
        });

        if (response?.ok) {
          setIsOnline(true);
        }
      } catch (e) {
        console.log(e);
        setIsOnline(false);
      }
    };

    window.addEventListener("online", checkStatus);
    window.addEventListener("offline", checkStatus);
    checkStatus();

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", checkStatus);
      window.removeEventListener("offline", checkStatus);
    };
  }, []);

  return {
    isOnline,
    timeOffline: isOnline ? 0 : elapsed,
    timeOnline: isOnline ? elapsed : 0,
  };
};
