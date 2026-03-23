import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { ChatState } from "../Context/ChatProvider";
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from "../config/ChatLogics";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageBubble } from "./MessageBubble";

const ScrollableChat = ({ messages, onReact, reactionBusyId }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => {
          const mine = m.sender._id === user._id;
          const showAvatar =
            isSameSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id);
          const initials = m.sender.name?.slice(0, 2).toUpperCase() || "?";

          return (
            <div className="flex w-full" key={m._id}>
              {showAvatar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="mt-1.5 mr-2 h-9 w-9 shrink-0 sm:h-8 sm:w-8">
                      <AvatarImage src={m.sender.avatar} alt="" />
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{m.sender.name}</TooltipContent>
                </Tooltip>
              )}
              {!showAvatar && <span className="mr-2 w-8 shrink-0 sm:w-9" aria-hidden />}
              <MessageBubble
                message={m}
                mine={mine}
                currentUserId={user._id}
                onReact={onReact}
                busyId={reactionBusyId}
                marginStyle={{
                  marginLeft: isSameSenderMargin(messages, m, i, user._id),
                  marginTop: isSameUser(messages, m, i) ? 6 : 12,
                }}
              />
            </div>
          );
        })}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
