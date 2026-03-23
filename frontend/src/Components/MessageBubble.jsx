import React, { useState } from "react";
import { SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { QUICK_REACTIONS, groupReactionsForDisplay } from "@/lib/chat-reactions";

export function MessageBubble({ message, mine, marginStyle, currentUserId, onReact, busyId }) {
  const [open, setOpen] = useState(false);
  const reactions = message.reactions || [];
  const grouped = groupReactionsForDisplay(reactions, currentUserId);
  const id = message._id;
  const isBusy = busyId === id;

  const handlePick = async (emoji) => {
    setOpen(false);
    await onReact(id, emoji);
  };

  return (
    <div
      className={cn(
        "group/msg relative flex max-w-[min(88%,30rem)] flex-col gap-1 sm:max-w-[75%]",
        mine ? "ml-auto items-end" : "items-start"
      )}
      style={marginStyle}
    >
      <div
        className={cn(
          "relative px-[0.85rem] pb-2.5 pt-2 text-[0.9375rem] leading-relaxed shadow-md backdrop-blur-[2px] transition-[box-shadow,transform] duration-200",
          "rounded-[1.35rem]",
          mine
            ? "rounded-br-[0.45rem] bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-primary/25"
            : "rounded-bl-[0.45rem] border border-border/50 bg-gradient-to-b from-muted/95 to-muted/80 text-foreground shadow-black/10 dark:from-muted/90 dark:to-muted/70 dark:shadow-black/30",
          "hover:shadow-lg",
          mine ? "hover:shadow-primary/35" : "hover:shadow-black/15 dark:hover:shadow-black/40"
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      <div
        className={cn(
          "flex max-w-full flex-wrap items-center gap-1",
          mine ? "justify-end pr-0.5" : "justify-start pl-0.5"
        )}
      >
        {grouped.map(({ emoji, count, label, iReacted }) => {
          const chip = (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => onReact(id, emoji)}
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors",
                iReacted
                  ? "border-primary/60 bg-primary/15 text-foreground"
                  : "border-border/60 bg-background/80 text-muted-foreground hover:bg-accent",
                isBusy && "pointer-events-none opacity-60"
              )}
            >
              <span className="text-sm leading-none">{emoji}</span>
              {count > 1 ? <span className="tabular-nums">{count}</span> : null}
            </button>
          );
          if (!label) return <React.Fragment key={emoji}>{chip}</React.Fragment>;
          return (
            <Tooltip key={emoji}>
              <TooltipTrigger asChild>{chip}</TooltipTrigger>
              <TooltipContent side="top" className="max-w-[240px] text-xs">
                {label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={isBusy}
              className={cn(
                "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground",
                "opacity-100 md:opacity-0 md:transition-opacity md:group-hover/msg:opacity-100"
              )}
              aria-label="Add reaction"
            >
              <SmilePlus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={mine ? "end" : "start"} className="w-auto p-2" onCloseAutoFocus={(e) => e.preventDefault()}>
            <div className="flex flex-wrap gap-0.5" role="group" aria-label="Pick a reaction">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-lg p-2 text-xl leading-none transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => handlePick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
