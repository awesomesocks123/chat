import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { usePublicRoomStore } from "../store/usePublicRoomStore";
import SideBar from "../components/SideBar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import PublicRoomContainer from "../components/PublicRoomContainer";

export const HomePage = () => {
  const { selectedUser } = useChatStore();
  const { selectedPublicRoom } = usePublicRoomStore();
  const [showSidebar, setShowSidebar] = useState(true);
  
  // On mobile, when a user or room is selected, automatically show the chat view
  useEffect(() => {
    if ((selectedUser || selectedPublicRoom) && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  }, [selectedUser, selectedPublicRoom]);

  // Toggle sidebar visibility (for mobile view)
  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  // Check if we have either a selected user or a selected public room
  const hasSelectedChat = selectedUser || selectedPublicRoom;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar - hidden on mobile when chat is shown */}
            <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 lg:w-1/4`}>
              <SideBar toggleSidebar={toggleSidebar} />
            </div>
            
            {/* Chat Container - hidden on mobile when sidebar is shown */}
            <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/3 lg:w-3/4`}>
              {!hasSelectedChat ? (
                <NoChatSelected toggleSidebar={toggleSidebar} />
              ) : selectedPublicRoom ? (
                <PublicRoomContainer toggleSidebar={toggleSidebar} />
              ) : (
                <ChatContainer toggleSidebar={toggleSidebar} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
