import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
const ChatHeader = () => {
  const { selectedUser, setSelectedUser, addFriend, friends, getFriends, selectedChatSession, setSelectedChatSession } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [isFriend, setIsFriend] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    // Check if selected user is already a friend
    if (selectedUser && Array.isArray(friends)) {
      const friendIds = friends.map(friend => friend._id);
      setIsFriend(friendIds.includes(selectedUser._id));
    } else {
      setIsFriend(false);
    }
  }, [selectedUser, friends]);
  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {selectedUser && (
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
          )}
          {/* User Info */}
          {selectedUser && (
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
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Add to Friends button */}
          {selectedUser && !isFriend ? (
            <button
              className="btn btn-sm btn-outline btn-primary"
              onClick={async () => {
                setIsAdding(true);
                await addFriend(selectedUser._id);
                await getFriends();
                setIsAdding(false);
              }}
              disabled={isAdding}
            >
              <i className={`i-user-plus ${isAdding ? "animate-spin" : ""}`}></i>
              <span className="hidden md:inline">Add Friend</span>
            </button>
          ) : selectedUser && isFriend ? (
            <button className="btn btn-sm btn-ghost btn-disabled">
              <i className="i-user-check text-success"></i>
              <span className="hidden md:inline">Friends</span>
            </button>
          ) : null}
          
          {/* X button to close out */}
          <button
            className="cursor-pointer hover:bg-base-200 px-2 py-2 rounded-2xl hover:text-primary hover:scale-105 transition-transform"
            onClick={() => {
              setSelectedUser(null);
              setSelectedChatSession(null);
            }}
          >
            <i className="i-x"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
