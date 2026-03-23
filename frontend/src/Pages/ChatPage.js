import React, { useState } from "react";
import { ChatState } from "../Context/ChatProvider";
import SideDrawer from "../Components/Misc/SideDrawer";
import MyChats from "../Components/MyChats";
import ChatBox from "../Components/ChatBox";

const ChatPage = () => {
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user } = ChatState();

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      {user && <SideDrawer />}
      <div className="flex min-h-0 w-full flex-1 items-stretch gap-2 px-2 py-2 sm:gap-3 sm:px-3 sm:py-3 lg:gap-4 lg:px-4">
        {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
