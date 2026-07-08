import type { DemoEntry } from "./types";
import { metadata as pwaCore } from "@/features/pwa-core/services/metadata";
import { metadata as auth } from "@/features/auth/services/metadata";
import { metadata as demo3d } from "@/features/3d/services/metadata";
import { metadata as mediaCapture } from "@/features/media-capture/services/metadata";
import { metadata as pushNotifications } from "@/features/push-notifications/services/metadata";
import { metadata as voiceInterface } from "@/features/voice-interface/services/metadata";
import { metadata as offlineDataLayer } from "@/features/offline-data-layer/services/metadata";
import { metadata as nativeIntegrations } from "@/features/native-integrations/services/metadata";
import { metadata as deviceSensors } from "@/features/device-sensors/services/metadata";
import { metadata as dashboards } from "@/features/dashboards/services/metadata";
import { metadata as realtime } from "@/features/realtime/services/metadata";
import { metadata as microFrontends } from "@/features/micro-frontends/services/metadata";
import { metadata as reactQuery } from "@/features/react-query/services/metadata";
import { metadata as performance } from "@/features/performance/services/metadata";
import { metadata as forms } from "@/features/forms/services/metadata";
import { metadata as graphql } from "@/features/graphql/services/metadata";

export const registry: DemoEntry[] = [
  { ...pwaCore },
  { ...auth },
  { ...demo3d },
  { ...mediaCapture },
  { ...pushNotifications },
  { ...voiceInterface },
  { ...offlineDataLayer },
  { ...nativeIntegrations },
  { ...deviceSensors },
  { ...dashboards },
  { ...realtime },
  { ...microFrontends },
  { ...reactQuery },
  { ...performance },
  { ...forms },
  { ...graphql },
];
