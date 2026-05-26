import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallPromptState {
  canInstall: boolean;
  isInstalling: boolean;
  install: () => Promise<void>;
  dismiss: () => void;
}

export const useInstallPrompt = (): InstallPromptState => {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();

      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setCanInstall(true);
    };

    const handleAppInstalled = () => {
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    try {
      await deferredPrompt?.prompt();

      await deferredPrompt?.userChoice;

      setCanInstall(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Erro ao instalar:", error);
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    setCanInstall(false);
    setDeferredPrompt(null);
  }, []);

  return { canInstall, isInstalling, install, dismiss };
};
