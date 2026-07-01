import type { DemoEntry } from "./types";
import { metadata as auth } from "@/features/auth/services/metadata";
import { metadata as demo3d } from "@/features/3d/services/metadata";

export const registry: DemoEntry[] = [{ ...auth }, { ...demo3d }];
