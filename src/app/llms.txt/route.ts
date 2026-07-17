import { registry } from "@/registry/index";
import { getSiteUrl } from "@/lib/site-url";

const LIVE_DEMO_SUMMARIES: Record<string, string> = {
  "pwa-core":
    "Installable app experience: native install prompt, multi-strategy caching, and real connectivity detection via Serwist.",
  auth: "Five modern login patterns in one flow: JWT, OAuth 2.0, TOTP 2FA, Magic Link, and WebAuthn/Passkeys.",
  demo3d:
    "Four real-time 3D scenes built with React Three Fiber: orbit controls, an interactive solar system, a particle galaxy shader, and a scroll-driven camera journey.",
  "media-capture":
    "Camera capture, screen recording, and audio recording straight from the browser, no plugins.",
  "push-notifications":
    "Native OS push notifications delivered even with the app closed, via Service Worker and VAPID.",
  "voice-interface":
    "Real-time speech-to-text dictation and text-to-speech playback, entirely in the browser, no external AI API.",
  "offline-data-layer":
    "Fully offline data persistence with automatic sync on reconnect, including SQLite running over WebAssembly inside a Web Worker (OPFS).",
  "native-integrations":
    "Four browser APIs that make a web app behave like a native OS application: Web Share, Clipboard, Screen Wake Lock, Fullscreen.",
  "device-sensors":
    "Real-time network, battery, and vibration state for adaptive UX.",
};

const buildLlmsTxt = (siteUrl: string) => {
  const liveDemos = registry.filter((demo) => demo.status === "live");

  const demoLines = liveDemos
    .map((demo) => {
      const summary = LIVE_DEMO_SUMMARIES[demo.id] ?? "";
      return `- [${demo.id}](${siteUrl}/showcase/${demo.id}): ${summary}`;
    })
    .join("\n");

  return `# Dev Showcase

> A single Next.js (App Router) application where each route is a self-contained, working demonstration of a modern web engineering capability — a technical portfolio by Jordão Beghetto Massariol.

Stack: Next.js, TypeScript, React, Tailwind CSS, React Three Fiber, next-intl (pt-BR/en-US/es-ES), Feature-Sliced Design.

## Live demos

${demoLines}

## Other pages

- [Home](${siteUrl}): overview and full demo catalog.
- [About](${siteUrl}/sobre): author background, skills, and resume.
`;
};

export const GET = () => {
  const siteUrl = getSiteUrl();

  return new Response(buildLlmsTxt(siteUrl), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
