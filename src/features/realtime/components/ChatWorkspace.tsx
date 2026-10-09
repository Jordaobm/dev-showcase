"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSession } from "../hooks/useSession";
import { useMessageNotifications } from "../hooks/useMessageNotifications";
import { RoomDeletedEvent, RoomMemberJoinedEvent, useRoomSocket } from "../hooks/useRoomSocket";
import {
  ChatMessage,
  ApiError,
  ChatRoom,
  createRoom,
  deleteRoom,
  getOnlineMemberIds,
  joinRoomByLink,
  listMessages,
  listRooms,
  extractRoomLink as extractLinkId,
  MessageEntry,
  pingPresence,
} from "../services/api";
import { ChatPanel } from "./ChatPanel";
import { CreateRoomModal } from "./CreateRoomModal";
import { DeleteRoomModal } from "./DeleteRoomModal";
import { RoomSidebar } from "./RoomSidebar";

const ROOMS_QUERY_KEY = ["realtime-rooms"];
const messagesQueryKey = (roomId: string | null) => ["realtime-messages", roomId];
const presenceQueryKey = (roomId: string | null) => ["realtime-presence", roomId];

const PRESENCE_PING_INTERVAL_MS = 15_000;
const PRESENCE_POLL_INTERVAL_MS = 5_000;
const ROOMS_REFETCH_INTERVAL_MS = 60_000;

const buildRoomLink = (roomLink: string) =>
  `${window.location.origin}${window.location.pathname}?room=${roomLink}`;

export const ChatWorkspace = () => {
  const t = useTranslations("realtime");
  const { user, logout } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");
  const handledRoomParamRef = useRef<string | null>(null);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const [createdRoomLink, setCreatedRoomLink] = useState<string | null>(null);
  const [joinErrorCode, setJoinErrorCode] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);
  const [roomNotice, setRoomNotice] = useState<string | null>(null);
  const deletingRoomIdRef = useRef<string | null>(null);
  const selectedRoomIdRef = useRef<string | null>(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: listRooms,
    refetchInterval: ROOMS_REFETCH_INTERVAL_MS,
  });

  const { data: rawMessages = [] } = useQuery({
    queryKey: messagesQueryKey(selectedRoomId),
    queryFn: () => listMessages(selectedRoomId as string),
    enabled: !!selectedRoomId,
  });

  const { data: onlineMemberIds = [] } = useQuery({
    queryKey: presenceQueryKey(selectedRoomId),
    queryFn: () => getOnlineMemberIds(selectedRoomId as string),
    enabled: !!selectedRoomId,
    refetchInterval: PRESENCE_POLL_INTERVAL_MS,
  });

  useEffect(() => {
    if (!user) return;

    pingPresence().catch(() => {});
    const interval = setInterval(() => {
      pingPresence().catch(() => {});
    }, PRESENCE_PING_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user]);

  const { mutateAsync: mutateCreateRoom, isPending: isCreating } = useMutation({
    mutationFn: (name: string) => createRoom({ roomTitle: name }),
  });

  const { mutateAsync: mutateDeleteRoom, isPending: isDeleting } = useMutation({
    mutationFn: (roomId: string) => deleteRoom(roomId),
  });

  const { mutateAsync: mutateJoinRoom, isPending: isJoining } = useMutation({
    mutationFn: (link: string) => joinRoomByLink({ link }),
  });

  const handleIncomingMessage = useCallback(
    (incoming: MessageEntry) => {
      queryClient.setQueryData<MessageEntry[]>(
        messagesQueryKey(selectedRoomId),
        (old = []) => [...old, incoming],
      );
    },
    [queryClient, selectedRoomId],
  );

  const handleRoomUpdate = useCallback(
    (event: RoomMemberJoinedEvent) => {
      queryClient.setQueryData<ChatRoom[]>(ROOMS_QUERY_KEY, (old = []) =>
        old.map((r) =>
          r.id === String(event.roomId)
            ? { ...r, participantCount: event.participantCount }
            : r,
        ),
      );
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
    [queryClient],
  );

  const closeDeletedRoom = useCallback(
    (roomId: string) => {
      setSelectedRoomId((current) => (current === roomId ? null : current));
      setMobileView("sidebar");
      queryClient.removeQueries({ queryKey: messagesQueryKey(roomId) });
      queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
    },
    [queryClient],
  );

  const handleRoomDeleted = useCallback(
    (event: RoomDeletedEvent) => {
      const roomId = String(event.roomId);
      if (selectedRoomIdRef.current === roomId) {
        if (event.reason === "expired") {
          setRoomNotice(t("chatRoomExpiredNotice"));
        } else if (deletingRoomIdRef.current !== roomId) {
          setRoomNotice(t("chatRoomDeletedNotice"));
        }
      }
      closeDeletedRoom(roomId);
    },
    [closeDeletedRoom, t],
  );

  const handleSocketReconnect = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: messagesQueryKey(selectedRoomId) });
    queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
  }, [queryClient, selectedRoomId]);

  const { sendMessage: sendSocketMessage } = useRoomSocket(
    selectedRoomId,
    user?.token,
    {
      onMessage: handleIncomingMessage,
      onRoomUpdate: handleRoomUpdate,
      onRoomDeleted: handleRoomDeleted,
      onReconnect: handleSocketReconnect,
    },
  );

  const handleOpenRoomFromNotification = useCallback((roomId: string) => {
    setRoomNotice(null);
    setSelectedRoomId(roomId);
    setMobileView("chat");
  }, []);

  const { enabled: notificationsEnabled, toggle: toggleNotifications } =
    useMessageNotifications(user?.token, {
      selectedRoomId,
      onOpenRoom: handleOpenRoomFromNotification,
      onRoomDeleted: handleRoomDeleted,
    });

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  const room = rooms.find((r) => r.id === selectedRoomId) ?? null;
  const isRoomOwner = !!room && room.ownerId === user?.id;
  const shareLink = room && isRoomOwner ? buildRoomLink(room.link) : null;

  const messages: ChatMessage[] = rawMessages.map((m) => ({
    id: String(m.id),
    senderId: String(m.jwtUser.id),
    senderName: m.jwtUser.name,
    content: m.content,
    createdAt: m.sentAt,
    isMine: m.jwtUser.id === user?.id,
  }));

  const participants = (room?.members ?? []).map((member) => ({
    id: String(member.id),
    name: member.id === user?.id ? user?.username ?? member.name : member.name,
    isOnline: onlineMemberIds.includes(member.id),
  }));

  const selectRoom = (id: string) => {
    setRoomNotice(null);
    setSelectedRoomId(id);
    setMobileView("chat");
  };

  const handleCreateRoom = async (name: string) => {
    const newRoom = await mutateCreateRoom(name);
    setCreatedRoomId(String(newRoom.id));
    setCreatedRoomLink(buildRoomLink(newRoom.link));
    await queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
  };

  const handleFinishCreate = () => {
    setShowCreateModal(false);
    setCreatedRoomId(null);
    setCreatedRoomLink(null);
  };

  const handleGoToCreatedRoom = () => {
    if (createdRoomId) selectRoom(createdRoomId);
    handleFinishCreate();
  };

  const handleJoinByLink = async (link: string) => {
    setJoinErrorCode(null);
    try {
      const joinedRoom = await mutateJoinRoom(link);
      await queryClient.cancelQueries({ queryKey: ROOMS_QUERY_KEY });
      const freshRooms = await queryClient.fetchQuery({
        queryKey: ROOMS_QUERY_KEY,
        queryFn: listRooms,
        staleTime: 0,
      });
      queryClient.setQueryData(ROOMS_QUERY_KEY, freshRooms);
      selectRoom(String(joinedRoom.id));
    } catch (error) {
      const code = error instanceof ApiError ? error.code : undefined;
      if (code === "room_already_member") {
        const memberRooms = await queryClient.fetchQuery({
          queryKey: ROOMS_QUERY_KEY,
          queryFn: listRooms,
        });
        const existing = memberRooms.find((r) => r.link === extractLinkId(link));
        if (existing) {
          selectRoom(existing.id);
          return;
        }
      }
      setJoinErrorCode(code ?? "unknown");
    }
  };

  useEffect(() => {
    if (!roomParam || !user || handledRoomParamRef.current === roomParam) return;
    handledRoomParamRef.current = roomParam;
    router.replace(pathname);
    void handleJoinByLink(roomParam);
  }, [roomParam, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteRoom = async () => {
    if (!room) return;
    setDeleteFailed(false);
    deletingRoomIdRef.current = room.id;
    try {
      await mutateDeleteRoom(room.id);
      setShowDeleteModal(false);
      closeDeletedRoom(room.id);
    } catch {
      deletingRoomIdRef.current = null;
      setDeleteFailed(true);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedRoomId) return;
    sendSocketMessage(content);
  };

  return (
    <div className="flex h-full min-h-0 relative">
      <div
        className={`${mobileView === "sidebar" ? "flex" : "hidden"} md:flex flex-col w-full md:w-auto`}
      >
        <RoomSidebar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          username={user?.username ?? ""}
          onSelectRoom={selectRoom}
          onCreateRoom={() => setShowCreateModal(true)}
          onJoinByLink={handleJoinByLink}
          joinErrorCode={joinErrorCode}
          onClearJoinError={() => setJoinErrorCode(null)}
          onLogout={logout}
          isJoining={isJoining}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={toggleNotifications}
        />
      </div>

      <div
        className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 min-w-0`}
      >
        <ChatPanel
          room={room}
          messages={messages}
          participants={participants}
          shareLink={shareLink}
          notice={roomNotice}
          onDeleteRoom={isRoomOwner ? () => setShowDeleteModal(true) : undefined}
          onSendMessage={handleSendMessage}
          onCreateRoom={() => setShowCreateModal(true)}
          onBackToSidebar={() => setMobileView("sidebar")}
        />
      </div>

      {showDeleteModal && room && (
        <DeleteRoomModal
          roomName={room.name}
          isDeleting={isDeleting}
          hasError={deleteFailed}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteFailed(false);
          }}
          onConfirm={handleDeleteRoom}
        />
      )}

      {showCreateModal && (
        <CreateRoomModal
          onClose={handleFinishCreate}
          onCreate={handleCreateRoom}
          onGoToRoom={handleGoToCreatedRoom}
          createdRoomLink={createdRoomLink}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};
