import { useEffect, useRef, useState } from "react";
import { usePublicRoomStore } from "../store/usePublicRoomStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import PublicRoomHeader from "./PublicRoomHeader";
import PublicRoomMessageInput from "./PublicRoomMessageInput";
import MessagesSkeleton from "./MessagesSkeleton";
import { formatDistanceToNow } from "date-fns";
import PublicRoomParticipantsPanel from "./PublicRoomParticipantsPanel";

const PublicRoomContainer = ({ toggleSidebar }) => {
  const {
    selectedPublicRoom,
    publicRoomMessages,
    publicRoomParticipants,
    isPublicRoomMessagesLoading,
    getPublicRoomMessages,
    getPublicRoomParticipants,
    cleanupPublicRoomChat,
  } = usePublicRoomStore();
  
  const { authUser } = useAuthStore();
  const { friends } = useChatStore();
  const messagesEndRef = useRef(null);
  const [showParticipants, setShowParticipants] = useState(false);
  
  // Helper function to check if a user is a friend
  const isFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [publicRoomMessages]);

  // Fetch public room data when a room is selected
  useEffect(() => {
    if (selectedPublicRoom && selectedPublicRoom._id) {
      // Get messages for this public room
      getPublicRoomMessages(selectedPublicRoom._id);
      
      // Get room participants
      getPublicRoomParticipants(selectedPublicRoom._id);
      
      // Clean up when component unmounts or room changes
      return () => {
        cleanupPublicRoomChat();
      };
    }
  }, [selectedPublicRoom, getPublicRoomMessages, getPublicRoomParticipants, cleanupPublicRoomChat]);

  // Loading state for public room chat
  if (selectedPublicRoom && isPublicRoomMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <PublicRoomHeader 
          toggleSidebar={toggleSidebar} 
          room={selectedPublicRoom}
          participantCount={publicRoomParticipants.length}
        />
        <div className="flex-1 p-4 overflow-auto">
          <MessagesSkeleton />
        </div>
      </div>
    );
  }

  // No room selected
  if (!selectedPublicRoom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base-200">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-2">No Room Selected</h2>
          <p className="text-base-content/70 mb-4">
            Select a public room from the sidebar or explore new rooms to join.
          </p>
          <button 
            className="btn btn-primary"
            onClick={toggleSidebar}
          >
            Browse Rooms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PublicRoomHeader 
        toggleSidebar={toggleSidebar} 
        room={selectedPublicRoom}
        participantCount={publicRoomParticipants.length}
        showParticipants={showParticipants}
        setShowParticipants={setShowParticipants}
      />
      
      {showParticipants ? (
        <div className="flex-1 overflow-auto">
          <PublicRoomParticipantsPanel 
            participants={publicRoomParticipants} 
            onClose={() => setShowParticipants(false)} 
          />
        </div>
      ) : (
        <div className="flex-1 p-4 overflow-auto">
          {publicRoomMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-4">
                <h3 className="font-bold text-lg">No messages yet</h3>
                <p className="text-base-content/70">Be the first to send a message!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {publicRoomMessages.map((message) => {
                // Check if the message is from the current user
                const isCurrentUser = message.sender._id === authUser._id;
                
                return (
                  <div
                    key={message._id}
                    className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
                  >
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img
                          alt={message.sender.fullName || "User"}
                          src={message.sender.profilePic || "/default-avatar.png"}
                        />
                      </div>
                    </div>
                    <div className="chat-header">
                      {isCurrentUser || isFriend(message.sender._id) 
                        ? message.sender.fullName || "User"
                        : message.sender.username || message.sender.fullName || "User"}
                      <time className="text-xs opacity-50 ml-1">
                        {message.createdAt
                          ? formatDistanceToNow(new Date(message.createdAt), {
                              addSuffix: true,
                            })
                          : "just now"}
                      </time>
                    </div>
                    <div className={`chat-bubble ${isCurrentUser ? "chat-bubble-primary" : ""}`}>
                      {message.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      )}
      
      {!showParticipants && <PublicRoomMessageInput />}
    </div>
  );
};

export default PublicRoomContainer;
