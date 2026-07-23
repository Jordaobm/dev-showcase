import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

export const useClientSnapshot = <T,>(
  getSnapshot: () => T,
  serverSnapshot: T,
): T => useSyncExternalStore(noopSubscribe, getSnapshot, () => serverSnapshot);
