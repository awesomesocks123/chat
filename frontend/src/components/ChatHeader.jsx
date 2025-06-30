import React from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X } from "lucide-react";
const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={selectedUser.profilePic || "/avatar.png"}
                alt={selectedUser.fullName}
              />
            </div>
          </div>
          {/* User Info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <div className="flex items-center gap-1.5">
              <div className={`${(onlineUsers ?? []).includes(selectedUser?._id) 
                ? "status status-md status-success animate-pulse" 
                : "status status-md status-gray-500 opacity-50"}` }></div>
              <p className={`text-xs ${(onlineUsers ?? []).includes(selectedUser?._id) 
                ? "text-success font-medium" 
                : "text-base-content/50"}`}>
                {(onlineUsers ?? []).includes(selectedUser?._id)
                  ? "Online"
                  : "Offline"}
              </p>
            </div>
          </div>
        </div>
        {/* X button to close out */}
        <button
          className="cursor-pointer hover:bg-base-200 px-2 py-2 rounded-2xl hover:text-primary hover:scale-105 transition-transform"
          onClick={() => setSelectedUser(null)}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
