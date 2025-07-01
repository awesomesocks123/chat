import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  selectedUser: null,
  users: [],
  friends: [],
  messages: [],
  isUsersLoading: false,
  viewMode: "chats", // "chats" or "friends"
  activeChats: [],
  chatSessions: [],
  selectedChatSession: null,
  blockedUsers: [],
  
  setViewMode: (viewMode) => set({ viewMode }),
  
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users");
      set({ users: res.data, isUsersLoading: false });
    } catch (error) {
      console.log(error);
      set({ isUsersLoading: false });
    }
  },
  
  getFriends: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends");
      set({ friends: res.data, isUsersLoading: false });
    } catch (error) {
      console.log(error);
      set({ isUsersLoading: false });
    }
  },
  
  getActiveChats: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/users/active-chats");
      set({ activeChats: res.data, isUsersLoading: false });
    } catch (error) {
      console.log(error);
      set({ isUsersLoading: false });
    }
  },
  
  getMessages: async (chatSessionId) => {
    set({ isUsersLoading: true });
    try {
      if (!chatSessionId) {
        console.error("No chat session ID provided");
        set({ messages: [], isUsersLoading: false });
        return;
      }
      
      console.log("Getting messages for chat session:", chatSessionId);
      const res = await axiosInstance.get(`/messages/${chatSessionId}`);
      set({ messages: res.data, isUsersLoading: false });
      
      // Subscribe to this chat session
      const socket = useAuthStore.getState().socket;
      if (socket) {
        // Join the chat session room
        socket.emit("joinChatSession", chatSessionId);
        console.log(`Joined chat session room: ${chatSessionId}`);
        
        // Listen for new messages in this chat session
        socket.on("newMessage", (message) => {
          console.log("Received new message:", message);
          // Add the new message to the messages array
          set((state) => ({
            messages: [...state.messages, message],
          }));
          
          // Update the chat sessions list with the new message
          set((state) => ({
            chatSessions: state.chatSessions.map((session) => {
              if (session.chatSessionId === chatSessionId) {
                return {
                  ...session,
                  lastMessage: message,
                  unreadCount: session.unreadCount + 1
                };
              }
              return session;
            }),
          }));
        });
      }
    } catch (error) {
      console.log(error);
      set({ isUsersLoading: false });
    }
  },
  
  sendMessage: async (message, chatSessionId) => {
    try {
      // Send the message to the server
      const res = await axiosInstance.post(`/messages/${chatSessionId}`, {
        text: message,
      });
      
      // Add the new message to the messages array
      set((state) => ({
        messages: [...state.messages, res.data],
      }));
      
      // Update the chat sessions list with the new message
      set((state) => ({
        chatSessions: state.chatSessions.map((session) => {
          if (session.chatSessionId === chatSessionId) {
            return {
              ...session,
              lastMessage: res.data,
            };
          }
          return session;
        }),
      }));
      
      return res.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  
  getRandomUser: async () => {
    try {
      const res = await axiosInstance.get("/chat-sessions/random/match");
      console.log("Random match response:", res.data);
      
      if (res.data && res.data.user) {
        // Get the chat session details
        const chatSessionRes = await axiosInstance.get(`/chat-sessions/session/${res.data.chatSessionId}`);
        const chatSession = chatSessionRes.data;
        
        // Set the selected user and chat session
        set({ 
          selectedUser: res.data.user,
          selectedChatSession: chatSession
        });
        
        // Get messages for this chat session
        get().getMessages(res.data.chatSessionId);
        
        // Update the chat sessions list with the new chat session
        get().getRecentMessages();
        
        return res.data.user;
      }
      return null;
    } catch (error) {
      console.log("Error in getRandomUser:", error);
      
      // Check if the error is because the user already has chat sessions with all available users
      if (error.response?.data?.error?.includes("You already have chat sessions with all available users")) {
        toast.error("No new users available for matching. Delete some existing chats to match with new users.");
      } else {
        toast.error(error.response?.data?.error || "Failed to get random user");
      }
      
      return null;
    }
  },
  
  addFriend: async (friendId) => {
    try {
      const res = await axiosInstance.post("/friends", { friendId });
      return res.data;
    } catch (error) {
      console.log(error);
      return null;
    }
  },
  
  getRecentMessages: async () => {
    try {
      const res = await axiosInstance.get("/chat-sessions");
      console.log("Got chat sessions:", res.data);
      
      // Process each chat session to extract the other user
      const processedSessions = res.data.map(session => {
        return get().processChatSession(session);
      });
      
      set({ chatSessions: processedSessions });
      return processedSessions;
    } catch (error) {
      console.log("Error getting recent messages:", error);
      return [];
    }
  },
  
  processChatSession: (chatSession) => {
    if (!chatSession) return null;
    
    const authUser = useAuthStore.getState().authUser;
    
    // Find the other user in the participants array
    let otherUser = null;
    if (chatSession.participants && chatSession.participants.length > 0) {
      otherUser = chatSession.participants.find(
        (user) => user._id !== authUser._id
      );
    }
    
    // If we couldn't find the other user, this is probably a self-chat or invalid
    if (!otherUser) {
      console.warn("Could not find other user in chat session:", chatSession);
      return null;
    }
    
    // Return a processed chat session with the other user and last message
    return {
      chatSessionId: chatSession._id,
      otherUser,
      lastMessage: chatSession.lastMessage,
      unreadCount: chatSession.unreadCount || 0
    };
  },
  
  cleanupChat: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    // Remove event listener
    socket.off("newMessage");
    
    // Leave the chat session room if we have one
    if (get().selectedChatSession && get().selectedChatSession._id) {
      socket.emit("leaveChatSession", get().selectedChatSession._id);
      console.log(`Left chat session room: ${get().selectedChatSession._id}`);
    }
  },
  
  setSelectedUser: async (selectedUser) => set({ selectedUser }),
  setSelectedChatSession: (selectedChatSession) => set({ selectedChatSession }),
  
  deleteChatSession: async (chatSessionId) => {
    try {
      set({ isLoading: true });
      
      // Call the API to delete the chat session
      await axiosInstance.delete(`/chat-sessions/session/${chatSessionId}`);
      
      // Update the local state
      set(state => ({
        chatSessions: state.chatSessions.filter(session => session.chatSessionId !== chatSessionId),
        // If the deleted session was selected, clear the selection
        selectedChatSession: state.selectedChatSession?._id === chatSessionId ? null : state.selectedChatSession,
        selectedUser: state.selectedChatSession?._id === chatSessionId ? null : state.selectedUser,
        messages: state.selectedChatSession?._id === chatSessionId ? [] : state.messages
      }));
      
      toast.success("Chat session deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting chat session:", error);
      toast.error(error.response?.data?.error || "Failed to delete chat session");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  blockUser: async (userId, reason = "") => {
    try {
      set({ isLoading: true });
      
      // Call the API to block the user
      await axiosInstance.post(`/blocked-users/block/${userId}`, { reason });
      
      // Get the chat session with this user if it exists
      const { selectedChatSession, selectedUser } = get();
      
      // Update the local state - remove any chat sessions with this user
      set(state => ({
        chatSessions: state.chatSessions.filter(session => 
          session.otherUser?._id !== userId
        ),
        // If the blocked user was selected, clear the selection
        selectedChatSession: selectedUser?._id === userId ? null : state.selectedChatSession,
        selectedUser: selectedUser?._id === userId ? null : state.selectedUser,
        messages: selectedUser?._id === userId ? [] : state.messages
      }));
      
      toast.success("User blocked successfully");
      return true;
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error(error.response?.data?.error || "Failed to block user");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  reportUser: async (userId, reason) => {
    try {
      set({ isLoading: true });
      
      // Call the API to report the user
      await axiosInstance.post(`/blocked-users/report/${userId}`, { reason });
      
      toast.success("User reported successfully");
      return true;
    } catch (error) {
      console.error("Error reporting user:", error);
      toast.error(error.response?.data?.error || "Failed to report user");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  getBlockedUsers: async () => {
    try {
      set({ isLoading: true });
      
      // Call the API to get blocked users
      const response = await axiosInstance.get('/blocked-users');
      
      // Update the state with blocked users
      set({ blockedUsers: response.data });
      
      return response.data;
    } catch (error) {
      console.error("Error getting blocked users:", error);
      toast.error("Failed to get blocked users");
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
  
  unblockUser: async (userId) => {
    try {
      set({ isLoading: true });
      
      // Call the API to unblock the user
      await axiosInstance.delete(`/blocked-users/unblock/${userId}`);
      
      // Update the blocked users list
      set(state => ({
        blockedUsers: state.blockedUsers.filter(block => block.blocked._id !== userId)
      }));
      
      toast.success("User unblocked successfully");
      return true;
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },
  
  // Socket message subscription management
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    // Subscribe to new messages
    socket.on("newMessage", (message) => {
      // Add the new message to the messages array
      set(state => ({
        messages: [...state.messages, message]
      }));
      
      // Update the chat sessions list with the new message
      get().getRecentMessages();
    });
    
    console.log("Subscribed to messages");
  },
  
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    // Unsubscribe from new messages
    socket.off("newMessage");
    
    console.log("Unsubscribed from messages");
  }
}));
