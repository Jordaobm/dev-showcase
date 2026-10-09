import {
  AppWindow,
  Bell,
  Box,
  Camera,
  Code,
  Database,
  Gauge,
  Layers,
  LayoutDashboard,
  MessageSquare,
  Mic,
  Plug,
  RefreshCw,
  ShieldCheck,
  Share2,
  Smartphone,
  TextCursorInput,
  type LucideIcon,
} from "lucide-react";

const demoIcons: Record<string, LucideIcon> = {
  "pwa-core": AppWindow,
  auth: ShieldCheck,
  demo3d: Box,
  "media-capture": Camera,
  "push-notifications": Bell,
  "voice-interface": Mic,
  "offline-data-layer": Database,
  "native-integrations": Plug,
  "device-sensors": Smartphone,
  dashboards: LayoutDashboard,
  realtime: MessageSquare,
  "micro-frontends": Layers,
  "react-query": RefreshCw,
  performance: Gauge,
  forms: TextCursorInput,
  graphql: Share2,
};

export const getDemoIcon = (demoId: string): LucideIcon =>
  demoIcons[demoId] ?? Code;
