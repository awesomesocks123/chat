import { useState, useEffect } from "react";
import ChatContainer from "./ChatContainer";
import PublicRoomContainer from "./PublicRoomContainer";
import FriendRequests from "./FriendRequests";
import { MessageSquare, Users, UserPlus } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const ChatTabs = ({ toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState("private"); // "private", "public", or "requests"
  const { receivedFriendRequests, getReceivedFriendRequests } = useChatStore();
  
  useEffect(() => {
    // Load friend requests when component mounts
    getReceivedFriendRequests();
    
    // Set up an interval to check for new friend requests every minute
    const interval = setInterval(() => {
      getReceivedFriendRequests();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [getReceivedFriendRequests]);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="tabs tabs-boxed bg-base-200 p-2">
        <button
          className={`tab ${activeTab === "private" ? "tab-active" : ""} gap-2`}
          onClick={() => setActiveTab("private")}
        >
          <MessageSquare size={16} />
          Private Chats
        </button>
        <button
          className={`tab ${activeTab === "public" ? "tab-active" : ""} gap-2`}
          onClick={() => setActiveTab("public")}
        >
          <Users size={16} />
          Public Rooms
        </button>
        <button
          className={`tab ${activeTab === "requests" ? "tab-active" : ""} gap-2 relative`}
          onClick={() => setActiveTab("requests")}
        >
          <UserPlus size={16} />
          Friend Requests
          {receivedFriendRequests.length > 0 && (
            <span className="badge badge-sm badge-error absolute -top-2 -right-2">
              {receivedFriendRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "private" ? (
          <ChatContainer toggleSidebar={toggleSidebar} />
        ) : activeTab === "public" ? (
          <PublicRoomContainer toggleSidebar={toggleSidebar} />
        ) : (
          <div className="p-4 overflow-auto h-full">
            <FriendRequests />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatTabs;
