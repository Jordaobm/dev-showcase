"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isOnline } from "../services/api";

export const useOnlineSync = () => {
  const [showSyncing, setShowSyncing] = useState(false);
  const syncingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: ["isOnline"],
    queryFn: isOnline,
    retry: false,
  });

  const { refetch } = query;

  useEffect(() => {
    const handleOffline = () => refetch();
    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, [refetch]);

  useEffect(() => {
    if (syncingTimer.current) clearTimeout(syncingTimer.current);
    if (query.isFetching) {
      syncingTimer.current = setTimeout(() => setShowSyncing(true), 0);
    } else {
      syncingTimer.current = setTimeout(() => setShowSyncing(false), 2000);
    }
    return () => {
      if (syncingTimer.current) clearTimeout(syncingTimer.current);
    };
  }, [query.isFetching]);

  return { showSyncing, ...query };
};
