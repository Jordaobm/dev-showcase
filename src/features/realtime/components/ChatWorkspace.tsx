"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSiteUrl } from "@/lib/site-url";
import { useSession } from "../hooks/useSession";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { fetchParticipants, SELF_PARTICIPANT_ID } from "../services/mockApi";
import {
  ChatMessage,
  createRoom,
  joinRoomByLink,
  listMessages,
  listRooms,
  MessageEntry,
} from "../services/api";
import { ChatPanel } from "./ChatPanel";
import { CreateRoomModal } from "./CreateRoomModal";
import { RoomSidebar } from "./RoomSidebar";

const ROOMS_QUERY_KEY = ["realtime-rooms"];
const messagesQueryKey = (roomId: string | null) => ["realtime-messages", roomId];

export const ChatWorkspace = () => {
  const { user, logout } = useSession();
  const queryClient = useQueryClient();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"sidebar" | "chat">("sidebar");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdRoomLink, setCreatedRoomLink] = useState<string | null>(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ROOMS_QUERY_KEY,
    queryFn: listRooms,
  });

  const { data: rawMessages = [] } = useQuery({
    queryKey: messagesQueryKey(selectedRoomId),
    queryFn: () => listMessages(selectedRoomId as string),
    enabled: !!selectedRoomId,
  });

  const { data: rawParticipants = [] } = useQuery({
    queryKey: ["realtime-mock-participants", selectedRoomId],
    queryFn: () => fetchParticipants(selectedRoomId as string),
    enabled: !!selectedRoomId,
  });

  const { mutateAsync: mutateCreateRoom, isPending: isCreating } = useMutation({
    mutationFn: (name: string) => createRoom({ roomTitle: name }),
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

  const { sendMessage: sendSocketMessage } = useRoomSocket(
    selectedRoomId,
    user?.token,
    { onMessage: handleIncomingMessage },
  );

  const room = rooms.find((r) => r.id === selectedRoomId) ?? null;

  // Alinhamento à direita/esquerda: comparar o autor de cada mensagem com o usuário logado.
  const messages: ChatMessage[] = rawMessages.map((m) => ({
    id: String(m.id),
    senderId: String(m.jwtUser.id),
    senderName: m.jwtUser.name,
    content: m.content,
    createdAt: m.sentAt,
    isMine: m.jwtUser.id === user?.id,
  }));

  const participants = rawParticipants.map((p) =>
    p.id === SELF_PARTICIPANT_ID ? { ...p, name: user?.username ?? p.name } : p,
  );

  const selectRoom = (id: string) => {
    setSelectedRoomId(id);
    setMobileView("chat");
  };

  const handleCreateRoom = async (name: string) => {
    const newRoom = await mutateCreateRoom(name);
    setCreatedRoomLink(`${getSiteUrl()}/realtime/rooms/${newRoom.link}`);
    await queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
  };

  const handleFinishCreate = () => {
    setShowCreateModal(false);
    setCreatedRoomLink(null);
  };

  const handleJoinByLink = async (link: string) => {
    await mutateJoinRoom(link);
    await queryClient.invalidateQueries({ queryKey: ROOMS_QUERY_KEY });
  };

  const handleSendMessage = (content: string) => {
    if (!selectedRoomId) return;
    // Não anexa no cache aqui: a própria mensagem enviada volta pelo WebSocket via
    // handleIncomingMessage, porque o broadcast do backend inclui quem enviou (Passo 4.3).
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
          onLogout={logout}
          isJoining={isJoining}
        />
      </div>

      <div
        className={`${mobileView === "chat" ? "flex" : "hidden"} md:flex flex-1 min-w-0`}
      >
        <ChatPanel
          room={room}
          messages={messages}
          participants={participants}
          onSendMessage={handleSendMessage}
          onCreateRoom={() => setShowCreateModal(true)}
          onBackToSidebar={() => setMobileView("sidebar")}
        />
      </div>

      {showCreateModal && (
        <CreateRoomModal
          onClose={handleFinishCreate}
          onCreate={handleCreateRoom}
          createdRoomLink={createdRoomLink}
          isCreating={isCreating}
        />
      )}
    </div>
  );
};
