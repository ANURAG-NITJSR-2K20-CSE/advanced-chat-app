import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const UserListItem = ({ user, handleFunction }) => {
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <button
      type="button"
      onClick={handleFunction}
      className={cn(
        "hover:border-primary flex min-h-12 w-full items-center gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left transition-colors sm:min-h-0",
        "hover:bg-accent focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar} alt="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{user.name}</p>
        <p className="text-muted-foreground truncate text-xs">
          <span className="font-semibold">Email:</span> {user.email}
        </p>
      </div>
    </button>
  );
};

export default UserListItem;
