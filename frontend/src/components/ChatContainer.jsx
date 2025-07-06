import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesSkeleton from "./MessagesSkeleton";
import { useAuthStore } from "../store/useAuthStore";


const ChatContainer = ({ toggleSidebar }) => {
  const { 
    messages, 
    getMessages, 
    isMessagesLoading, 
    selectedUser, 
    selectedChatSession,
    subscribeToMessages, 
    unsubscribeToMessages
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (selectedChatSession && selectedChatSession._id) {
      // If we have a selected chat session, get messages for it
      console.log("Loading messages for chat session:", selectedChatSession._id);
      getMessages(selectedChatSession._id);
      subscribeToMessages();
      return () => unsubscribeToMessages();
    }
    // We no longer try to get messages using just the selectedUser
    // This was causing confusion between user IDs and chat session IDs
  }, [selectedChatSession, getMessages, subscribeToMessages, unsubscribeToMessages]);

  // Loading state for private chat
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader toggleSidebar={toggleSidebar} />
        <MessagesSkeleton />
        <MessageInput isPublicRoom={false} />
      </div>
    );
  }
  
  // Render regular private chat
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader toggleSidebar={toggleSidebar} />
      <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? messages.map((message) => {
          // Use the pre-calculated isSentByMe flag from the backend if available
          let isSent = message.isSentByMe;
          
          // If isSentByMe is not available (for temporary messages or old format), calculate it
          if (isSent === undefined) {
            // For temporary messages, they're always sent by the current user
            if (message.isTemp) {
              isSent = true;
            } else {
              // Check if the message has a sender field (new format) or senderId (old format)
              // Handle both string and ObjectId comparison by converting to string
              isSent = message.sender 
                ? (typeof message.sender === 'string' 
                    ? message.sender === authUser._id.toString() 
                    : message.sender.toString() === authUser._id.toString())
                : (message.senderId && message.senderId.toString() === authUser._id.toString());
            }
          }
          
          return (
            <div
              key={message._id || `temp-${Date.now()}-${Math.random()}`}
              className={`chat ${isSent ? "chat-end" : "chat-start"}`}
            >
              {!isSent && (
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <img src={message.sender?.profilePic || "/avatar.png"} alt={message.sender?.fullName || "User"} />
                  </div>
                </div>
              )}
              <div className="chat-header mb-1">
                {!isSent && <span className="text-xs font-bold">{message.sender?.fullName || "Unknown User"}</span>}
              </div>
              <div className={`chat-bubble ${isSent ? "chat-bubble-primary" : ""}`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt='Attachment'
                    className='sm:max-w-[200px] rounded-md mb-2'
                  />
                )}
                {message.text && <p>{message.text}</p>}
              </div>
              <div className="chat-footer opacity-50 text-xs">
                {message.createdAt && !isNaN(new Date(message.createdAt)) 
                  ? new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : new Date().toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                }
              </div>
            </div>
          );
        }) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-base-content/50 text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput isPublicRoom={false} />
    </div>
  );
};

export default ChatContainer;
