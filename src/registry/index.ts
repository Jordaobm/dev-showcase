import type { DemoEntry } from "./types";
import { metadata as auth } from "@/features/auth/services/metadata";
import { metadata as demo3d } from "@/features/3d/services/metadata";
import { metadata as pwaCore } from "@/features/pwa-core/services/metadata";
import { metadata as mediaCapture } from "@/features/media-capture/services/metadata";
import { metadata as pushNotifications } from "@/features/push-notifications/services/metadata";
import { metadata as voiceInterface } from "@/features/voice-interface/services/metadata";
import { metadata as offlineDataLayer } from "@/features/offline-data-layer/services/metadata";
import { metadata as nativeIntegrations } from "@/features/native-integrations/services/metadata";
import { metadata as deviceSensors } from "@/features/device-sensors/services/metadata";

export const registry: DemoEntry[] = [
  { ...auth },
  { ...demo3d },
  { ...pwaCore },
  { ...mediaCapture },
  { ...pushNotifications },
  { ...voiceInterface },
  { ...offlineDataLayer },
  { ...nativeIntegrations },
  { ...deviceSensors },
];
