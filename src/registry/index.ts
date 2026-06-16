import type { DemoEntry } from "./types";
import { metadata as auth } from "@/features/auth/services/metadata";

export const registry: DemoEntry[] = [{ ...auth }];
