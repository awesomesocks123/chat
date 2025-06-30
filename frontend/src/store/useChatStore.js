import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";

// Helper to extract other user from chat session participants
const getOtherUser = (participants, currentUserId) => {
  return participants.find(user => user._id !== currentUserId);
};

export const useChatStore = create((set, get) => ({
  selectedUser: null,
  selectedChatSession: null,
  chatSessions: [],
  users: [],
  friends: [],
  activeChats: [],
  messages: [], // Initialize messages as empty array
  isUsersLoading: false,
  isMessagesLoading: false,
  viewMode: "chats", // "chats" or "friends"

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data, isUsersLoading: false });
    } catch (error) {
      console.log("Error fetching users", error);
      set({ isUsersLoading: false });
    }
  },
  
  // Get recent messages for sidebar (hybrid approach)
  getRecentMessages: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/recent-messages");
      console.log("Fetched recent messages:", res.data);
      
      set({ 
        chatSessions: res.data,
        isUsersLoading: false 
      });
      
      return res.data;
    } catch (error) {
      console.log("Error fetching recent messages", error);
      set({ isUsersLoading: false });
      return [];
    }
  },
  
  // Legacy method - keep for backward compatibility
  getChatSessions: async () => {
    set({ isUsersLoading: true });
    try {
      // Use the new getRecentMessages function instead
      return await get().getRecentMessages();
    } catch (error) {
      console.log("Error fetching chat sessions", error);
      set({ isUsersLoading: false });
      return [];
    }
  },
  
  // Process a chat session to extract the other participant
  processChatSession: (session) => {
    const authUser = useAuthStore.getState().authUser;
    
    // Ensure the session has valid participants
    if (!session.participants || !Array.isArray(session.participants) || session.participants.length < 2) {
      console.warn("Invalid chat session format:", session);
      return null;
    }
    
    // Find the other participant (not the current user)
    const otherUser = session.participants.find(
      user => user && user._id && user._id !== authUser._id
    );
    
    if (!otherUser) {
      console.warn("Could not find other user in session:", session);
      return {
        ...session,
        otherUser: {
          _id: "unknown",
          fullName: "Unknown User",
          profilePic: "/avatar.png"
        }
      };
    }
    
    return {
      ...session,
      otherUser
    };
  },
  
  getFriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends/list");
      set({ friends: res.data, isUsersLoading: false });
    } catch (error) {
      console.log("Error fetching friends", error);
      toast.error("Failed to load friends");
      set({ isUsersLoading: false });
    }
  },
  
  getActiveChats: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends/active-chats");
      set({ activeChats: res.data, isUsersLoading: false });
    } catch (error) {
      console.log("Error fetching active chats", error);
      set({ isUsersLoading: false });
    }
  },
  
  getRandomUser: async () => {
    set({ isUsersLoading: true });
    try {
      console.log("Fetching random user...");
      const res = await axiosInstance.get("/chat-sessions/random/match");
      console.log("Random match API response:", res.data);
      
      const { user, chatSessionId } = res.data;
      console.log("Matched with user:", user?.fullName, "Session ID:", chatSessionId);
      
      if (!user || !chatSessionId) {
        throw new Error("Invalid response from server");
      }
      
      // Get the full chat session
      const sessionDetailsRes = await axiosInstance.get(`/chat-sessions/session/${chatSessionId}`);
      const sessionRes = await axiosInstance.get(`/chat-sessions/${chatSessionId}/messages`);
      console.log("Chat session messages:", sessionRes.data);
      
      // Use the session details from the API
      const authUser = useAuthStore.getState().authUser;
      const chatSession = sessionDetailsRes.data;
      
      // Add messages to the chat session
      chatSession.messages = sessionRes.data || [];
      chatSession.lastMessage = sessionRes.data?.length > 0 ? sessionRes.data[sessionRes.data.length - 1] : null;
      
      set({ 
        selectedUser: user, 
        selectedChatSession: chatSession,
        messages: sessionRes.data || [],
        isUsersLoading: false 
      });
      
      // Subscribe to messages for this chat session
      get().subscribeToMessages();
      
      // Refresh chat sessions list
      await get().getChatSessions();
      
      return user;
    } catch (error) {
      console.log("Error getting random user", error);
      toast.error(error.response?.data?.error || "No users available for matching");
      set({ isUsersLoading: false });
      return null;
    }
  },
  
  addFriend: async (userId) => {
    try {
      await axiosInstance.post("/friends/add", { userId });
      toast.success("Friend added successfully");
      // Refresh friends list
      await get().getFriends();
    } catch (error) {
      console.log("Error adding friend", error);
      toast.error(error.response?.data?.error || "Failed to add friend");
    }
  },
  
  removeFriend: async (userId) => {
    try {
      await axiosInstance.delete(`/friends/remove/${userId}`);
      toast.success("Friend removed successfully");
      // Refresh friends list
      await get().getFriends();
    } catch (error) {
      console.log("Error removing friend", error);
      toast.error("Failed to remove friend");
    }
  },
  
  setViewMode: (mode) => {
    set({ viewMode: mode });
  },
  
  setSelectedChatSession: (chatSession) => {
    set({ selectedChatSession: chatSession });
  },
  getMessages: async (chatSessionId) => {
    if (!chatSessionId) return;
    
    set({ isMessagesLoading: true });
    
    try {
      console.log(`Fetching messages for chat session: ${chatSessionId}`);
      
      // Get messages for this session
      const messagesRes = await axiosInstance.get(`/chat-sessions/${chatSessionId}/messages`);
      console.log(`Received ${messagesRes.data.length} messages for chat session`);
      
      // If we don't have a selected chat session yet, get the full session details
      if (!get().selectedChatSession || get().selectedChatSession._id !== chatSessionId) {
        // This is either a direct session ID or a user ID
        // If it's a user ID, we need to get or create a chat session
        try {
          const sessionRes = await axiosInstance.get(`/chat-sessions/session/${chatSessionId}`);
          const chatSession = sessionRes.data;
          
          // Find the other user in the participants
          const authUser = useAuthStore.getState().authUser;
          const otherUser = chatSession.participants.find(
            user => user._id !== authUser._id
          );
          
          set({ 
            selectedChatSession: chatSession,
            selectedUser: otherUser
          });
          
          // Subscribe to messages for this chat session
          get().subscribeToMessages();
        } catch (sessionError) {
          console.log("Error fetching chat session", sessionError);
        }
      }
      
      set({ 
        messages: messagesRes.data,
        isMessagesLoading: false
      });
      
      return messagesRes.data;
    } catch (error) {
      console.log("Error fetching messages", error);
      toast.error("Failed to load messages");
      set({ isMessagesLoading: false });
      return [];
    }
  },
  sendMessage: async (message) => {
    const { selectedUser, selectedChatSession } = get();
    
    if (!selectedUser || !selectedChatSession) {
      console.log("No chat session selected, cannot send message");
      toast.error("Please select a user to chat with");
      return;
    }
    
    try {
      console.log(`Sending message to chat session: ${selectedChatSession._id}`);
      
      // Add receiverId to the message payload
      const messageWithReceiver = {
        ...message,
        receiverId: selectedUser._id
      };
      
      // Create a temporary message to show immediately in the UI
      const tempId = `temp-${Date.now()}`;
      const authUser = useAuthStore.getState().authUser;
      const tempMessage = {
        _id: tempId,
        sender: authUser._id,  // Important: use the current user's ID as sender
        text: message.text,
        image: message.image,
        createdAt: new Date().toISOString(),
        isTemp: true,  // Flag to identify temporary messages
        isSentByMe: true  // Always true for messages sent by the current user
      };
      
      // Add the temporary message to the UI immediately
      set({ messages: [...get().messages, tempMessage] });
      
      // Also update the recent messages without a full refresh
      set(state => {
        const updatedSessions = state.chatSessions.map(session => {
          if (session.chatSessionId === selectedChatSession._id) {
            return {
              ...session,
              lastMessage: {
                text: message.text,
                image: message.image,
                sender: authUser._id,
                createdAt: new Date().toISOString()
              },
              // Reset unread count for our own messages
              unreadCount: 0
            };
          }
          return session;
        });
        
        // Move the updated session to the top of the list
        const updatedSessionIndex = updatedSessions.findIndex(s => s.chatSessionId === selectedChatSession._id);
        if (updatedSessionIndex > 0) {
          const [updatedSession] = updatedSessions.splice(updatedSessionIndex, 1);
          updatedSessions.unshift(updatedSession);
        }
        
        return { chatSessions: updatedSessions };
      });
      
      // Send the actual message to the server
      const res = await axiosInstance.post(`/chat-sessions/${selectedChatSession._id}/messages`, messageWithReceiver);
      console.log("Message sent successfully:", res.data);
      
      // Replace the temporary message with the real one from the server
      set(state => ({
        messages: state.messages.map(msg => 
          msg._id === tempId ? res.data : msg
        )
      }));
      
      return res.data;
    } catch (error) {
      console.log("Error sending message", error);
      toast.error("Failed to send message");
      
      // Remove the temporary message if sending failed
      set(state => ({
        messages: state.messages.filter(msg => !msg.isTemp)
      }));
      
      return null;
    }
  },
  subscribeToMessages: () => {
    const { selectedUser, selectedChatSession } = get();
    if (!selectedUser || !selectedChatSession) return;
  
    const socket = useAuthStore.getState().socket;
    const authUser = useAuthStore.getState().authUser;
    
    // Join the chat session room
    socket.emit("joinChatSession", selectedChatSession._id);
    
    // Remove existing listener to prevent duplicates
    socket.off("newMessage");
    
    // Add new listener
    socket.on("newMessage", (data) => {
      console.log("Received new message via socket:", data);
      
      // Extract the message data
      const messageData = data.message || data;
      const chatSessionId = data.chatSessionId;
      const senderId = messageData.sender || messageData.senderId;
      
      // Ensure the message has a valid createdAt date and _id
      const processedMessage = {
        ...messageData,
        _id: messageData._id || `temp-${Date.now()}`,
        chatSessionId: chatSessionId,
        createdAt: messageData.createdAt || new Date().toISOString(),
        // Explicitly identify if this is from the current user or not
        sender: senderId,
        isSentByMe: senderId && senderId.toString() === authUser._id.toString()
      };
      
      console.log("Processing socket message:", processedMessage);
      
      // Check if this message is already in our state (to avoid duplicates)
      const isDuplicate = get().messages.some(msg => 
        msg._id === processedMessage._id || 
        (msg.isTemp && msg.text === processedMessage.text && 
         Math.abs(new Date(msg.createdAt) - new Date(processedMessage.createdAt)) < 5000)
      );
      
      // Only update the messages array if we're currently viewing this chat session
      if (!isDuplicate && selectedChatSession && chatSessionId === selectedChatSession._id) {
        set({ 
          messages: [...get().messages, processedMessage]
        });
      }
      
      // Always update the recent messages in the sidebar
      set(state => {
        // Find if we already have this chat session in our recent messages
        const existingSessionIndex = state.chatSessions.findIndex(
          session => session.chatSessionId === chatSessionId
        );
        
        let updatedSessions = [...state.chatSessions];
        
        // Update the last message and unread count
        if (existingSessionIndex !== -1) {
          const session = updatedSessions[existingSessionIndex];
          
          // Only increment unread count if the message is from the other user
          const unreadCount = !processedMessage.isSentByMe ? 
            (session.unreadCount || 0) + 1 : 
            (session.unreadCount || 0);
          
          // Update the session with new last message and unread count
          updatedSessions[existingSessionIndex] = {
            ...session,
            lastMessage: {
              text: processedMessage.text,
              image: processedMessage.image,
              sender: processedMessage.sender,
              createdAt: processedMessage.createdAt
            },
            unreadCount: unreadCount
          };
          
          // Move this session to the top of the list
          if (existingSessionIndex > 0) {
            const [updatedSession] = updatedSessions.splice(existingSessionIndex, 1);
            updatedSessions.unshift(updatedSession);
          }
        } else {
          // If we don't have this session yet, we'll need to fetch recent messages
          // This could happen if this is a new chat session
          get().getRecentMessages();
        }
        
        return { chatSessions: updatedSessions };
      });
    });
  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedChatSession } = get();
    
    // Remove event listener
    socket.off("newMessage");
    
    // Leave the chat session room if we have one
    if (selectedChatSession && selectedChatSession._id) {
      socket.emit("leaveChatSession", selectedChatSession._id);
      console.log(`Left chat session room: ${selectedChatSession._id}`);
    }
  },
  setSelectedUser: async (selectedUser) => set({ selectedUser }),
  setSelectedChatSession: (selectedChatSession) => set({ selectedChatSession }),
}));
