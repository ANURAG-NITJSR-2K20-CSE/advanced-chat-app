import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Eye, Loader2 } from "lucide-react";
import { ChatState } from "../../Context/ChatProvider";
import UserBadgeItem from "../UserAvatar/UserBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
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

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
  const [open, setOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [search, setSearch] = useState("");
  const [mutating, setMutating] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);

  const { selectedChat, setSelectedChat, user } = ChatState();
  const { results, isSearching, searchError, executeNow } = useDebouncedUserSearch(search, user?.token, open);

  const handleAddUser = async (addedUser) => {
    if (selectedChat.users.find((u) => u._id === addedUser._id)) {
      toast.error("User is already in this group");
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only the admin can add members");
      return;
    }
    setMutating(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.patch(
        "/api/chat/groupadd",
        {
          chatId: selectedChat._id,
          userId: addedUser._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      toast.success("Member added");
    } catch (error) {
      toast.error("Could not add user", { description: error.message });
    } finally {
      setMutating(false);
    }
  };

  const handleRemove = async (removedUser) => {
    const leavingSelf = removedUser._id === user._id;
    if (!leavingSelf && selectedChat.groupAdmin._id !== user._id) {
      toast.error("Only the admin can remove other members");
      return;
    }
    setMutating(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.patch(
        "/api/chat/groupremove",
        {
          chatId: selectedChat._id,
          userId: removedUser._id,
        },
        config
      );
      if (removedUser._id === user._id) setSelectedChat("");
      else setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
    } catch (error) {
      toast.error("Could not update group", { description: error.message });
    } finally {
      setMutating(false);
    }
  };

  const handleRename = async () => {
    if (!groupChatName?.trim()) return;
    setRenameLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.patch(
        "/api/chat/rename",
        {
          chatId: selectedChat._id,
          chatName: groupChatName.trim(),
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setGroupChatName("");
      toast.success("Group name updated");
    } catch (error) {
      toast.error("Rename failed", { description: error.message });
    } finally {
      setRenameLoading(false);
    }
  };

  if (!selectedChat?.isGroupChat) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch("");
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label="Group settings">
          <Eye className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">{selectedChat.chatName}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-wrap gap-2 border-b pb-3">
            {selectedChat.users.map((u) => (
              <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)} />
            ))}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="rename-group">New group name</Label>
              <Input
                id="rename-group"
                placeholder="Group name"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
                disabled={renameLoading || mutating}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                disabled={renameLoading || mutating}
                onClick={handleRename}
                className="w-full sm:w-auto"
              >
                {renameLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update name"}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-members">Add users</Label>
            <div className="flex gap-2">
              <Input
                id="add-members"
                placeholder="Search users"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (search.trim().length >= MIN_USER_SEARCH_LENGTH) executeNow();
                  }
                }}
                disabled={mutating}
                autoComplete="off"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={mutating || isSearching || search.trim().length < MIN_USER_SEARCH_LENGTH}
                onClick={() => executeNow()}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Go"}
              </Button>
            </div>
          </div>
          {searchError && (
            <p className="text-destructive text-center text-sm" role="alert">
              {searchError}
            </p>
          )}
          <ScrollArea className="h-40 rounded-none border-2 border-border p-2">
            {isSearching && !searchError ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin opacity-60" aria-label="Searching" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {!isSearching && search.trim().length < MIN_USER_SEARCH_LENGTH && (
                  <EmptyState title="Search" description={`At least ${MIN_USER_SEARCH_LENGTH} characters.`} className="py-4" />
                )}
                {!isSearching &&
                  search.trim().length >= MIN_USER_SEARCH_LENGTH &&
                  results.length === 0 &&
                  !searchError && <EmptyState title="No users found" className="py-4" />}
                {results.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleAddUser(u)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="destructive" disabled={mutating} onClick={() => handleRemove(user)}>
            {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Leave group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateGroupChatModal;
