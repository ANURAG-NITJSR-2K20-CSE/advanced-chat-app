import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Search, Bell, ChevronDown, Loader2 } from "lucide-react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModal from "./ProfileModal";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import { getSender } from "../../config/ChatLogics";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge/lib/components/NotificationBadge";
import { useDebouncedUserSearch } from "../../hooks/useDebouncedUserSearch";
import { MIN_USER_SEARCH_LENGTH } from "@/lib/ui-constants";
import { EmptyState } from "../EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, setSelectedChat, chats, setChats, bell, setBell } = ChatState();
  const navigate = useNavigate();

  const { results, isSearching, searchError, executeNow } = useDebouncedUserSearch(
    search,
    user?.token,
    sheetOpen
  );

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const onSearchSubmit = () => {
    if (search.trim().length < MIN_USER_SEARCH_LENGTH) {
      toast.warning(`Type at least ${MIN_USER_SEARCH_LENGTH} characters to search.`);
      return;
    }
    executeNow();
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setSheetOpen(false);
    } catch (error) {
      toast.error("Could not open chat", { description: error.message || "Try again." });
    } finally {
      setLoadingChat(false);
    }
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div>
      <header className="bg-card flex min-h-[48px] w-full items-center justify-between border-b px-2 py-2 shadow-none sm:min-h-[52px] sm:px-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-11 min-w-11 gap-2 px-2 sm:h-9 sm:min-w-0 sm:px-3"
              onClick={() => setSheetOpen(true)}
            >
              <Search className="h-5 w-5 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">Search users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Find people to message (keyboard: open sheet, then type)</TooltipContent>
        </Tooltip>

        <h1 className="font-display text-lg tracking-[0.12em] sm:text-xl md:text-2xl">BaatCheet</h1>

        <div className="flex items-center gap-0.5">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 sm:h-9 sm:w-9"
                aria-label="Notifications"
              >
                <NotificationBadge count={bell.length} effect={Effect.SCALE} />
                <Bell className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              {!bell.length && (
                <div className="text-muted-foreground px-2 py-3 text-center text-sm">No new messages</div>
              )}
              <ScrollArea className={bell.length ? "max-h-64" : ""}>
                {bell.map((n) => (
                  <DropdownMenuItem
                    key={n._id}
                    className="cursor-pointer flex-col items-start gap-0.5 whitespace-normal"
                    onClick={() => {
                      setSelectedChat(n.chat);
                      setBell(bell.filter((note) => note !== n));
                    }}
                  >
                    <span className="font-medium leading-snug">
                      {n.chat.isGroupChat
                        ? `New message in ${n.chat.chatName}`
                        : `New message from ${getSender(user, n.chat.users)}`}
                    </span>
                  </DropdownMenuItem>
                ))}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-11 min-w-11 gap-1 px-2 sm:h-9 sm:min-w-0"
                aria-label={`Account menu for ${user?.name || "user"}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} alt="" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="text-muted-foreground h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer" onSelect={() => setProfileOpen(true)}>
                My profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={logoutHandler}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <ProfileModal user={user} open={profileOpen} onOpenChange={setProfileOpen} />

      <Sheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setSearch("");
        }}
      >
        <SheetContent
          side="left"
          className="flex w-full max-w-[100vw] flex-col gap-0 sm:max-w-md sm:rounded-none"
        >
          <SheetHeader>
            <SheetTitle>Search users</SheetTitle>
          </SheetHeader>
          <Separator className="my-4" />
          <div className="flex gap-2 pb-2">
            <Input
              placeholder="Name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
              aria-describedby="search-hint"
              autoComplete="off"
            />
            <Button type="button" onClick={onSearchSubmit} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>
          <p id="search-hint" className="text-muted-foreground pb-4 text-xs">
            At least {MIN_USER_SEARCH_LENGTH} characters. Results update as you type.
          </p>
          <ScrollArea className="min-h-0 flex-1 pr-3">
            {searchError && (
              <p className="text-destructive mb-3 text-center text-sm" role="alert">
                {searchError}
              </p>
            )}
            {isSearching && !searchError ? (
              <ChatLoading />
            ) : (
              <div className="flex flex-col gap-2 pb-4">
                {!isSearching &&
                  !searchError &&
                  search.trim().length < MIN_USER_SEARCH_LENGTH && (
                    <EmptyState
                      title="Start typing"
                      description={`Enter at least ${MIN_USER_SEARCH_LENGTH} characters to find people.`}
                    />
                  )}
                {!isSearching &&
                  !searchError &&
                  search.trim().length >= MIN_USER_SEARCH_LENGTH &&
                  results.length === 0 && (
                    <EmptyState title="No matches" description="Try a different name or email." />
                  )}
                {results.map((u) => (
                  <UserListItem key={u._id} user={u} handleFunction={() => accessChat(u._id)} />
                ))}
              </div>
            )}
            {loadingChat && (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-4 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Opening…
              </div>
            )}
          </ScrollArea>
          <SheetFooter className="mt-auto border-t pt-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setSheetOpen(false)}>
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SideDrawer;
