import React from "react";
import { ChatState } from "../Context/ChatProvider";
import SingleChat from "./SingleChat";
import { cn } from "@/lib/utils";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  const { selectedChat } = ChatState();

  return (
    <div
      className={cn(
        "bg-card flex min-h-0 min-w-0 flex-1 flex-col rounded-md border border-border shadow-none",
        selectedChat ? "flex" : "hidden md:flex"
      )}
    >
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default ChatBox;
