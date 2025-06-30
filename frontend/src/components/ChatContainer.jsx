import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesSkeleton from "./MessagesSkeleton";
import { useAuthStore } from "../store/useAuthStore";

const ChatContainer = () => {
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
      getMessages(selectedChatSession._id);
      subscribeToMessages();
      return () => unsubscribeToMessages();
    } else if (selectedUser && selectedUser._id) {
      // If we only have a selected user, get or create a chat session
      getMessages(selectedUser._id);
      subscribeToMessages();
      return () => unsubscribeToMessages();
    }
  }, [selectedUser, selectedChatSession, getMessages, subscribeToMessages, unsubscribeToMessages]);

  if (isMessagesLoading)
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessagesSkeleton />
        <MessageInput />
      </div>
    );
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? messages.map((message) => {
          // Check if the message has a sender field (new format) or senderId (old format)
          const isSent = message.sender 
            ? message.sender === authUser._id 
            : message.senderId === authUser._id;
          return (
            <div
              key={message._id}
              className={`flex ${isSent ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`
                  max-w-[80%] rounded-xl p-3 shadow-sm
                  ${isSent ? "bg-primary text-primary-content" : "bg-base-200"}
                `}
              >
                {message.image && (
                  <img
                    src={message.image}
                    alt='Attachment'
                    className='sm:max-w-[200px] rounded-md mb-2'
                  />
                )}
                {message.text && <p className='text-sm'>{message.text}</p>}
                <p
                  className={`text-[10px] mt-1.5 ${isSent ? "text-primary-content/70" : "text-base-content/70"}`}
                >
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
                </p>
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
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
