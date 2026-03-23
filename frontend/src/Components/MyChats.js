import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Plus, MessageCircle } from "lucide-react";
import { ChatState } from "../Context/ChatProvider";
import ChatLoading from "./ChatLoading";
import { getSender } from "../config/ChatLogics";
import GroupChatModal from "./Misc/GroupChatModal";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState("");
  const [listStatus, setListStatus] = useState("loading");
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

  const fetchChats = useCallback(async () => {
    if (!user?.token) return;
    setListStatus("loading");
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get("/api/chat", config);
      setChats(Array.isArray(data) ? data : []);
      setListStatus("ready");
    } catch {
      setListStatus("error");
      toast.error("Could not load chats", { description: "Check your connection and try again." });
    }
  }, [user?.token, setChats]);

  useEffect(() => {
    const raw = localStorage.getItem("userInfo");
    if (raw) {
      try {
        setLoggedUser(JSON.parse(raw));
      } catch {
        setLoggedUser("");
      }
    }
    fetchChats();
  }, [fetchAgain, fetchChats]);

  return (
    <div
      className={cn(
        "bg-card flex min-h-0 min-w-0 flex-1 flex-col rounded-md border border-border shadow-none md:max-w-[min(100%,22rem)] md:flex-none md:shrink-0 md:basis-[clamp(17rem,32%,24rem)] lg:max-w-[min(100%,26rem)] lg:basis-[clamp(18rem,30%,26rem)]",
        selectedChat ? "hidden md:flex" : "flex"
      )}
    >
      <div className="flex min-h-[48px] items-center justify-between gap-2 border-b px-3 py-2 sm:min-h-[52px] sm:px-4 sm:py-3">
        <h2 className="font-display text-xl tracking-wide sm:text-2xl">CHATS</h2>
        <GroupChatModal>
          <Button variant="outline" size="sm" className="shrink-0 gap-1" disabled={listStatus === "loading"}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New group</span>
          </Button>
        </GroupChatModal>
      </div>
      <div className="bg-muted/30 flex min-h-0 flex-1 flex-col rounded-b-md border-t border-border p-2 sm:p-3">
        {listStatus === "loading" && <ChatLoading />}
        {listStatus === "error" && (
          <EmptyState
            title="Chats unavailable"
            description="We could not load your conversations."
            className="py-8"
          >
            <Button type="button" size="sm" variant="secondary" onClick={() => fetchChats()}>
              Retry
            </Button>
          </EmptyState>
        )}
        {listStatus === "ready" && chats.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title="No chats yet"
            description="Search for users from the header, or start a group chat."
            className="py-8"
          />
        )}
        {listStatus === "ready" && chats.length > 0 && (
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-2 pr-3">
              {chats.map((chat) => (
                <button
                  key={chat._id}
                  type="button"
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "min-h-12 rounded-md border px-3 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-11 sm:py-2.5",
                    selectedChat?._id === chat._id
                      ? "border-primary bg-primary text-primary-foreground shadow-none"
                      : "border-border bg-background/80 text-foreground hover:bg-accent"
                  )}
                >
                  {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default MyChats;
