import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const UserBadgeItem = ({ user, handleFunction }) => {
  return (
    <button
      type="button"
      onClick={handleFunction}
      className={cn(
        "bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-none border border-border px-2.5 py-1 text-xs font-medium",
        "hover:bg-secondary/80 border border-transparent transition-colors",
        "focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
      )}
    >
      {user.name}
      <X className="h-3 w-3 opacity-70" aria-hidden />
    </button>
  );
};

export default UserBadgeItem;
