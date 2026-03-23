import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ChatState } from "../../Context/ChatProvider";
import UserListItem from "../UserAvatar/UserListItem";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import { useDebouncedUserSearch } from "../../hooks/useDebouncedUserSearch";
import { MIN_USER_SEARCH_LENGTH } from "@/lib/ui-constants";
import { EmptyState } from "../EmptyState";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const GroupChatModal = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);

  const { user, chats, setChats } = ChatState();
  const { results, isSearching, searchError, executeNow } = useDebouncedUserSearch(search, user?.token, open);

  const handleGroup = (userToAdd) => {
    if (selectedUsers.find((u) => u._id === userToAdd._id)) {
      toast.error("User already added");
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (deletedUser) => {
    setSelectedUsers(selectedUsers.filter((u) => u._id !== deletedUser._id));
  };

  const handleSubmit = async () => {
    if (!groupChatName?.trim() || selectedUsers.length < 1) {
      toast.warning("Add a chat name and at least one user");
      return;
    }
    setCreating(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        {
          name: groupChatName.trim(),
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        },
        config
      );
      setChats([data, ...chats]);
      setOpen(false);
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      toast.success("Group chat created");
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data || "Try again";
      toast.error("Failed to create chat", { description: String(msg) });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setGroupChatName("");
          setSelectedUsers([]);
          setSearch("");
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">Create group chat</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="gc-name">Group name</Label>
            <Input
              id="gc-name"
              placeholder="Team project"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              disabled={creating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gc-search">Add users</Label>
            <div className="flex gap-2">
              <Input
                id="gc-search"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (search.trim().length >= MIN_USER_SEARCH_LENGTH) executeNow();
                  }
                }}
                disabled={creating}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={creating || isSearching || search.trim().length < MIN_USER_SEARCH_LENGTH}
                onClick={() => executeNow()}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go"}
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">At least {MIN_USER_SEARCH_LENGTH} characters. Results update as you type.</p>
          </div>
          {searchError && (
            <p className="text-destructive text-center text-sm" role="alert">
              {searchError}
            </p>
          )}
          <div className="flex min-h-[2rem] flex-wrap gap-2">
            {selectedUsers.map((u) => (
              <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
            ))}
          </div>
          <ScrollArea className="h-48 rounded-none border-2 border-border p-2">
            {isSearching && !searchError ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 py-8 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!isSearching &&
                  search.trim().length >= MIN_USER_SEARCH_LENGTH &&
                  results.length === 0 &&
                  !searchError && <EmptyState title="No users found" description="Try another search." className="py-6" />}
                {!isSearching && search.trim().length < MIN_USER_SEARCH_LENGTH && (
                  <EmptyState title="Search users" description={`Type at least ${MIN_USER_SEARCH_LENGTH} characters.`} className="py-6" />
                )}
                {results.slice(0, 12).map((u) => (
                  <UserListItem key={u._id} user={u} handleFunction={() => handleGroup(u)} />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={creating}>
            {creating ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating…
              </span>
            ) : (
              "Create chat"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GroupChatModal;
