import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

const ProfileModal = ({ user, children, open: openProp, onOpenChange: onOpenChangeProp }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = typeof openProp === "boolean";
  const open = controlled ? openProp : internalOpen;
  const onOpenChange = controlled ? onOpenChangeProp : setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!controlled && (
        <DialogTrigger asChild>
          {children ?? (
            <Button variant="ghost" size="icon" aria-label="View profile">
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold sm:text-2xl">{user.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-2">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-32 w-32 rounded-full border border-border object-cover shadow-none ring-2 ring-border/40 sm:h-36 sm:w-36"
          />
          <p className="text-muted-foreground text-center text-sm">
            <span className="font-medium text-foreground">Email:</span> {user.email}
          </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
