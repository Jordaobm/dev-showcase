import { useEffect, useState } from "react";

export const useBreakpoint = (breakpoint: number = 1280) => {
  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false);
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsBelowBreakpoint(window.innerWidth < breakpoint);
      setWindowHeight(window.innerHeight);
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);

    return () => {
      window.removeEventListener("resize", checkBreakpoint);
    };
  }, [breakpoint]);

  return { isBelowBreakpoint, windowHeight };
};
