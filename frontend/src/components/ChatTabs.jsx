import { useState } from "react";
import ChatContainer from "./ChatContainer";
import PublicRoomContainer from "./PublicRoomContainer";
import { MessageSquare, Users } from "lucide-react";

const ChatTabs = ({ toggleSidebar }) => {
  const [activeTab, setActiveTab] = useState("private"); // "private" or "public"

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
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "private" ? (
          <ChatContainer toggleSidebar={toggleSidebar} />
        ) : (
          <PublicRoomContainer toggleSidebar={toggleSidebar} />
        )}
      </div>
    </div>
  );
};

export default ChatTabs;
