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
  
  getChatSessions: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/chat-sessions");
      console.log("Fetched chat sessions:", res.data);
      
      // Process chat sessions to extract other participant
      const authUser = useAuthStore.getState().authUser;
      const processedSessions = res.data
        .filter(session => {
          // Ensure the session has a valid participants array
          if (!session.participants || !Array.isArray(session.participants) || session.participants.length < 2) {
            console.warn("Invalid chat session format:", session);
            return false;
          }
          return true;
        })
        .map(session => {
          // Find the other participant (not the current user)
          const otherUser = session.participants.find(
            user => user && user._id && user._id !== authUser._id
          );
          
          if (!otherUser) {
            console.warn("Could not find other user in session:", session);
            // Create a placeholder user if we can't find the other user
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
            otherUser // Add the other user for easy access in UI
          };
        });
      
      console.log("Processed chat sessions:", processedSessions);
      set({ chatSessions: processedSessions, isUsersLoading: false });
      return processedSessions;
    } catch (error) {
      console.log("Error fetching chat sessions", error);
      set({ isUsersLoading: false });
      return [];
    }
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
      const sessionRes = await axiosInstance.get(`/chat-sessions/${chatSessionId}/messages`);
      console.log("Chat session messages:", sessionRes.data);
      
      // Create a proper chat session object
      const authUser = useAuthStore.getState().authUser;
      const chatSession = {
        _id: chatSessionId,
        participants: [user, authUser], // Include both participants
        messages: sessionRes.data || [],
        lastMessage: sessionRes.data?.length > 0 ? sessionRes.data[sessionRes.data.length - 1] : null
      };
      
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
          const sessionRes = await axiosInstance.get(`/chat-sessions/${chatSessionId}`);
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
      
      const res = await axiosInstance.post(`/chat-sessions/${selectedChatSession._id}/messages`, messageWithReceiver);
      console.log("Message sent successfully:", res.data);
      
      // Add the new message to the messages array
      set({ messages: [...get().messages, res.data] });
      
      // Refresh chat sessions to update last message
      await get().getChatSessions();
      
      return res.data;
    } catch (error) {
      console.log("Error sending message", error);
      toast.error("Failed to send message");
      return null;
    }
  },
  subscribeToMessages: () => {
    const { selectedUser, selectedChatSession } = get();
    if (!selectedUser || !selectedChatSession) return;
  
    const socket = useAuthStore.getState().socket;
    
    // Join the chat session room
    socket.emit("joinChatSession", selectedChatSession._id);
    
    socket.on("newMessage", (data) => {
      console.log("Received new message via socket:", data);
      
      // Check if this message belongs to our current chat session
      if (data.chatSessionId === selectedChatSession._id) {
        // The backend sends the message in a nested format, extract it
        const messageData = data.message || data;
        
        // Ensure the message has a valid createdAt date and _id
        const processedMessage = {
          ...messageData,
          _id: messageData._id || `temp-${Date.now()}`,
          chatSessionId: data.chatSessionId,
          createdAt: messageData.createdAt || new Date().toISOString()
        };
        
        console.log("Adding processed message to state:", processedMessage);
        
        set({ 
          messages: [...get().messages, processedMessage]
        });
        
        // Refresh chat sessions to update last message
        get().getChatSessions();
      }
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
