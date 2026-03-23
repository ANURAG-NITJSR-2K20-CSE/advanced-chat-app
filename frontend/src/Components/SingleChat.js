import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ChatState } from "../Context/ChatProvider";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./Misc/ProfileModal";
import UpdateGroupChatModal from "./Misc/UpdateGroupChatModal";
import ScrollableChat from "./ScrollableChat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ENDPOINT =
  process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_ENDPOINT || "http://localhost:8080";

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const socketRef = useRef(null);
  const selectedChatRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState(null);
  const [sending, setSending] = useState(false);
  const [reactionBusyId, setReactionBusyId] = useState(null);

  const { user, selectedChat, setSelectedChat, setBell } = ChatState();

  const handleReact = useCallback(
    async (messageId, emoji) => {
      if (!user?.token || !selectedChat) return;
      setReactionBusyId(messageId);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        const { data } = await axios.put(`/api/message/react/${messageId}`, { emoji }, config);
        setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
        socketRef.current?.emit("reaction updated", {
          chatId: selectedChat._id,
          message: data,
        });
      } catch (err) {
        const serverMsg = err.response?.data?.message;
        toast.error("Could not update reaction", {
          description: typeof serverMsg === "string" ? serverMsg : undefined,
        });
      } finally {
        setReactionBusyId(null);
      }
    },
    [user?.token, selectedChat]
  );

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
      setMessages(data);
      socketRef.current?.emit("join chat", selectedChat._id);
    } catch {
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    if (event.key !== "Enter" || sending) return;
    const content = newMessage.trim();
    if (!content) return;
    socketRef.current?.emit("stop typing", { room: selectedChat._id, userId: user._id });
    setSending(true);
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        {
          content,
          chatId: selectedChat._id,
        },
        config
      );
      setNewMessage("");
      socketRef.current?.emit("new message", data);
      setMessages((prev) => [...prev, data]);
    } catch {
      toast.error("Message not sent", { description: "Check your connection and press Enter to try again." });
    } finally {
      setSending(false);
    }
  };

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    if (!typing) {
      setTyping(true);
      socketRef.current?.emit("typing", {
        room: selectedChat._id,
        name: user?.name,
        userId: user?._id,
      });
    }
    const lastTypingTime = new Date().getTime();
    const timerLength = 2000;
    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socketRef.current?.emit("stop typing", { room: selectedChat._id, userId: user._id });
        setTyping(false);
      }
    }, timerLength);
  };

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  useEffect(() => {
    if (!user?._id) return;
    const s = io(ENDPOINT);
    socketRef.current = s;
    s.emit("setup", user);
    s.on("connected", () => setSocketConnected(true));
    s.on("typing", (payload) => {
      setIsTyping(true);
      setTypingName(
        payload && typeof payload === "object" && payload.name ? String(payload.name) : null
      );
    });
    s.on("stop typing", () => {
      setIsTyping(false);
      setTypingName(null);
    });
    s.on("message received", (newMessageReceived) => {
      const current = selectedChatRef.current;
      if (!current || current._id !== newMessageReceived.chat._id) {
        setBell((prev) => {
          if (prev.includes(newMessageReceived)) return prev;
          setFetchAgain((f) => !f);
          return [newMessageReceived, ...prev];
        });
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });
    s.on("message reaction", (updatedMessage) => {
      const chatId = updatedMessage.chat?._id ?? updatedMessage.chat;
      const current = selectedChatRef.current;
      if (!current || String(chatId) !== String(current._id)) return;
      setMessages((prev) => prev.map((m) => (m._id === updatedMessage._id ? updatedMessage : m)));
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- one socket per user id; avoid reconnect churn
  }, [user?._id]);

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat]);

  useEffect(() => {
    setIsTyping(false);
    setTypingName(null);
  }, [selectedChat?._id]);

  if (!selectedChat) {
    return (
      <div className="text-muted-foreground flex h-full min-h-[200px] flex-1 items-center justify-center px-4 py-6 text-center sm:min-h-[240px]">
        <p className="max-w-sm text-sm leading-relaxed sm:text-base">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:p-3 md:gap-3 lg:p-4">
      <div className="flex min-h-[44px] items-center justify-between gap-2 border-b pb-2 sm:min-h-[48px]">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 shrink-0 sm:h-9 sm:w-9 md:hidden"
            onClick={() => setSelectedChat("")}
            aria-label="Back to chats"
          >
            <ArrowLeft className="h-5 w-5 sm:h-5 md:h-4 md:w-4" />
          </Button>
          <h2 className="truncate text-base font-semibold sm:text-lg lg:text-xl">
            {!selectedChat.isGroupChat ? getSender(user, selectedChat.users) : selectedChat.chatName}
          </h2>
        </div>
        <div className="shrink-0">
          {!selectedChat.isGroupChat ? (
            <ProfileModal user={getSenderFull(user, selectedChat.users)} />
          ) : (
            <UpdateGroupChatModal
              fetchAgain={fetchAgain}
              setFetchAgain={setFetchAgain}
              fetchMessages={fetchMessages}
            />
          )}
        </div>
      </div>

      <div
        className={cn(
          "bg-netflix-chat flex min-h-0 flex-1 flex-col rounded-md border border-border p-2 shadow-none sm:p-3",
          "max-h-[calc(100dvh-11.5rem-env(safe-area-inset-bottom,0px))] xs:max-h-[calc(100dvh-10.5rem-env(safe-area-inset-bottom,0px))] md:max-h-[calc(100dvh-10rem-env(safe-area-inset-bottom,0px))] lg:max-h-[calc(100dvh-9.5rem-env(safe-area-inset-bottom,0px))]"
        )}
      >
        {loading ? (
          <div className="flex flex-1 items-center justify-center py-12 sm:py-16">
            <Loader2 className="text-primary h-9 w-9 animate-spin sm:h-10 sm:w-10" />
          </div>
        ) : (
          <div className="messages flex min-h-0 flex-1 flex-col overflow-y-auto pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ScrollableChat
              messages={messages}
              onReact={handleReact}
              reactionBusyId={reactionBusyId}
            />
          </div>
        )}
        <div className="mt-2 shrink-0 space-y-2 border-t border-border/60 bg-card/95 pt-2 sm:mt-3 sm:space-y-2 sm:pt-3">
          {isTyping && (
            <p className="text-muted-foreground text-xs font-medium">
              {typingName ? `${typingName} is typing…` : "Someone is typing…"}
            </p>
          )}
          <Input
            placeholder={sending ? "Sending…" : "Type a message and press Enter"}
            className="min-h-11 bg-background text-base sm:min-h-9 sm:text-sm"
            onKeyDown={sendMessage}
            onChange={typingHandler}
            value={newMessage}
            disabled={sending}
            aria-busy={sending}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleChat;
