import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatLoading = () => {
  return (
    <div className="flex flex-col gap-3 py-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full rounded-none" />
      ))}
    </div>
  );
};

export default ChatLoading;
