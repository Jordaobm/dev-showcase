/// <reference lib="webworker" />

import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "serwist";
import {
  readNotes,
  updateNote,
} from "./features/offline-data-layer/services/indexDB";
import {
  NOTE_STATUS,
  RETRY_REQUESTS,
  SYNC_COMPLETED,
} from "./features/offline-data-layer/types/INote";

declare const self: ServiceWorkerGlobalScope;

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: any;
  }
}

const OFFLINE_FALLBACK = "/offline";
const OFFLINE_PAGES = [OFFLINE_FALLBACK, "/", "/showcase/offline-data-layer"];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,

  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.endsWith(".pdf"),
      handler: new NetworkFirst({
        cacheName: "documents-cache",
      }),
    },
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: async (context) => {
        try {
          const strategy = new NetworkFirst({
            cacheName: "pages-cache",
            networkTimeoutSeconds: 2,
          });

          return await strategy.handle(context);
        } catch {
          const cache = await caches.open("pages-cache");

          const cached = await cache.match(context.request);
          if (cached) return cached;

          const offline = await caches.match(OFFLINE_FALLBACK);
          if (offline) return offline;

          return Response.error();
        }
      },
    },
    {
      matcher: ({ request }) =>
        request.destination === "script" || request.destination === "style",
      handler: new StaleWhileRevalidate({
        cacheName: "assets-cache",
      }),
    },
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "images-cache",
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {
    title: "Notificação",
    body: "Nova mensagem recebida!",
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open("pages-cache");

      for (const url of OFFLINE_PAGES) {
        try {
          const response = await fetch(url, {
            cache: "reload",
          });

          if (response.ok) {
            await cache.put(url, response.clone());
          }
        } catch (error) {
          console.log("Erro ao cachear:", url);
        }
      }

      await self.clients.claim();
    })(),
  );
});

const processQueue = async () => {
  await fetch("/health");

  const data = await readNotes();
  const offlineNotes = data.filter((e) => e.status === NOTE_STATUS.OFFLINE);

  for (const note of offlineNotes) {
    try {
      await updateNote({ ...note, status: NOTE_STATUS.ONLINE });
    } catch {}
  }

  const clients = await self.clients.matchAll();

  clients.forEach((client) =>
    client.postMessage({
      type: SYNC_COMPLETED,
    }),
  );
};

self.addEventListener("sync", (event) => {
  if (event.tag === RETRY_REQUESTS) {
    event.waitUntil(processQueue());
  }
});
