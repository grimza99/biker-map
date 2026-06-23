import { useEffect, useState } from "react";

export const useRemainingTime = (expiresAt: string | undefined) => {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );

      setRemainingSeconds(diff);
    };

    tick();

    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  const timerText = `${minutes}:${String(seconds).padStart(2, "0")}`;

  return { timerText, remainingSeconds };
};
