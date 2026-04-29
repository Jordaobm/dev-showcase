import { useState, useEffect } from "react";

const urlBase64ToUint8Array = (
  base64String: string,
): Uint8Array<ArrayBuffer> => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replaceAll("-", "+")
    .replaceAll("_", "/");
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.codePointAt(i)!;
  }
  return output;
};

interface UsePushSubscriptionReturn {
  subscription: PushSubscription | null;
  isSupported: boolean;
  isSubscribing: boolean;
  isSending: boolean;
  subscribeError: boolean;
  sendError: boolean;
  subscribe: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

export const usePushSubscription = (): UsePushSubscriptionReturn => {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [isSupported, setIsSupported] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [subscribeError, setSubscribeError] = useState(false);
  const [sendError, setSendError] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      navigator.serviceWorker !== undefined &&
      window.PushManager !== undefined;
    setIsSupported(supported);
    if (!supported) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then(setSubscription);
    });
  }, []);

  const subscribe = async () => {
    setIsSubscribing(true);
    setSubscribeError(false);
    try {
      const registration = await navigator.serviceWorker.ready;

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        ),
      });

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      if (!response.ok) throw new Error("subscribe_failed");

      setSubscription(sub);
    } catch {
      setSubscribeError(true);
    } finally {
      setIsSubscribing(false);
    }
  };

  const sendTestNotification = async () => {
    if (!subscription) return;
    setIsSending(true);
    setSendError(false);
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Dev Showcase",
          body: "Push notification funcionando via Web Push API!",
          subscription,
        }),
      });

      if (!response.ok) throw new Error("send_failed");
    } catch {
      setSendError(true);
    } finally {
      setIsSending(false);
    }
  };

  return {
    subscription,
    isSupported,
    isSubscribing,
    isSending,
    subscribeError,
    sendError,
    subscribe,
    sendTestNotification,
  };
};
