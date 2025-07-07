import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

// Track sent message IDs to prevent duplicates when they come back via socket
const sentMessageIds = new Set();

export const useChatStore = create((set, get) => ({
  selectedUser: null,
  users: [],
  messages: [],
  isUsersLoading: false,
  friends: [],
  activeChats: [],
  chatSessions: [],
  selectedChatSession: null,
  publicRooms: [],
  joinedPublicRooms: [], // Added joined public rooms state
  selectedPublicRoom: null,
  publicRoomMessages: [],
  isPublicRoomMessagesLoading: false,
  publicRoomParticipants: [],
  viewMode: "chats", // "chats" or "friends"
  blockedUsers: [],
  receivedFriendRequests: [],
  sentFriendRequests: [],

  setViewMode: (viewMode) => set({ viewMode }),

  getUsers: async () => {
    try {
      // This endpoint doesn't exist, we might need to create it
      // For now, let's use an empty array to prevent errors
      set({ users: [], isUsersLoading: false });
    } catch (error) {
      console.error("Error fetching users:", error);
      set({ isUsersLoading: false });
    }
  },

  getFriends: async () => {
    try {
      const res = await axiosInstance.get("/friends/list");
      set({ friends: res.data });
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  },
  
  getReceivedFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests/received");
      set({ receivedFriendRequests: res.data });
    } catch (error) {
      console.error("Error fetching received friend requests:", error);
    }
  },
  
  getSentFriendRequests: async () => {
    try {
      const res = await axiosInstance.get("/friends/requests/sent");
      set({ sentFriendRequests: res.data });
    } catch (error) {
      console.error("Error fetching sent friend requests:", error);
    }
  },

  getActiveChats: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/friends/active-chats");
      set({ activeChats: res.data, isUsersLoading: false });
    } catch (error) {
      console.error("Error fetching active chats:", error);
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (chatSessionId) => {
    set({ isUsersLoading: true });
    try {
      if (!chatSessionId) {
        console.error("No chat session ID provided");
        set({ messages: [], isUsersLoading: false });
        return [];
      }

      // Check if we're trying to get messages for a public room instead
      const selectedPublicRoom = get().selectedPublicRoom;
      if (selectedPublicRoom && selectedPublicRoom._id) {
        console.log("Public room is selected, not fetching private messages");
        set({ isUsersLoading: false });
        return [];
      }

      console.log("Getting messages for chat session:", chatSessionId);
      // Use the correct endpoint for chat session messages
      const res = await axiosInstance.get(`/chat-sessions/${chatSessionId}/messages`);
      set({ messages: res.data, isUsersLoading: false });
      console.log("Loaded messages:", res.data);

      // Subscribe to this chat session
      const socket = useAuthStore.getState().socket;
      if (socket) {
        // Join the chat session room
        socket.emit("joinChatSession", chatSessionId);
        console.log(`Joined chat session room: ${chatSessionId}`);
        
        // We don't set up socket listeners here anymore
        // This is now handled in the subscribeToMessages function
      }
    } catch (error) {
      console.log(error);
      set({ isUsersLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      // Get the selected chat session ID
      const selectedChatSession = get().selectedChatSession;
      if (!selectedChatSession || !selectedChatSession._id) {
        console.error('No chat session selected');
        return null;
      }
      
      const chatSessionId = selectedChatSession._id;

      // Get current user info for the temporary message
      const currentUser = useAuthStore.getState().user || useAuthStore.getState().authUser;
      if (!currentUser) {
        console.error("No user found, cannot send message");
        return null;
      }

      // Create a temporary message with current timestamp and temporary ID
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const tempMessage = {
        _id: tempId,
        text: messageData.text,
        image: messageData.image,
        sender: currentUser,
        chatSessionId,
        createdAt: new Date().toISOString(),
        isTemp: true, // Flag to identify temporary messages
        isSentByMe: true
      };
      
      // Add temporary message to state for immediate feedback
      set((state) => ({
        messages: [...state.messages, tempMessage]
      }));

      // Send the message to the API
      const res = await axiosInstance.post(`/chat-sessions/${chatSessionId}/messages`, {
        text: messageData.text,
        image: messageData.image
      });

      // Replace the temporary message with the confirmed message from server
      set((state) => ({
        messages: state.messages
          .filter((msg) => msg._id !== tempId)
          .concat(res.data)
      }));

      // Update the chat sessions list with the new message
      set((state) => ({
        chatSessions: state.chatSessions.map((session) => {
          const sessionId = session.chatSessionId || session._id;
          if (sessionId && sessionId.toString() === chatSessionId.toString()) {
            return {
              ...session,
              lastMessage: res.data
            };
          }
          return session;
        })
      }));

      // Refresh the sidebar to show the updated message
      get().getRecentMessages();

      return res.data;
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Remove the temporary message on error
      set((state) => ({
        messages: state.messages.filter(
          (msg) => !msg.isTemp
        )
      }));
      
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

  // Friend request functions
  sendFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/friends/request/send", { userId });
      toast.success("Friend request sent!");
      await get().getSentFriendRequests();
      return res.data;
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast.error(error.response?.data?.error || "Failed to send friend request");
      return null;
    }
  },

  // Add friend function (alias for sendFriendRequest for backward compatibility)
  addFriend: async (userId) => {
    try {
      return await get().sendFriendRequest(userId);
    } catch (error) {
      console.error("Error adding friend:", error);
      return null;
    }
  },
  
  acceptFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/friends/request/accept", { userId });
      toast.success("Friend request accepted!");
      await get().getReceivedFriendRequests();
      await get().getFriends();
      return res.data;
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error(error.response?.data?.error || "Failed to accept friend request");
      return null;
    }
  },
  
  declineFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/friends/request/decline", { userId });
      toast.success("Friend request declined");
      await get().getReceivedFriendRequests();
      return res.data;
    } catch (error) {
      console.error("Error declining friend request:", error);
      toast.error(error.response?.data?.error || "Failed to decline friend request");
      return null;
    }
  },
  
  cancelFriendRequest: async (userId) => {
    try {
      const res = await axiosInstance.post("/friends/request/cancel", { userId });
      toast.success("Friend request cancelled");
      await get().getSentFriendRequests();
      return res.data;
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      toast.error(error.response?.data?.error || "Failed to cancel friend request");
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
  
  cleanupPublicRoomChat: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove event listener
    socket.off("newRoomMessage");

    // Leave the public room if we have one
    if (get().selectedPublicRoom && get().selectedPublicRoom._id) {
      socket.emit("leavePublicRoom", get().selectedPublicRoom._id);
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
      toast.error(error.response?.data?.error || "Failed to get blocked users");
      return [];
    } finally {
      set({ isLoading: false });
    }
  },

  // Socket message subscription management
  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    // First, unsubscribe to avoid duplicate listeners
    get().unsubscribeToMessages();
    
    // Get the current chat session ID
    const currentChatSessionId = get().selectedChatSession?._id;
    if (!currentChatSessionId) {
      console.log("No chat session selected, not subscribing to messages");
      return;
    }
    
    // First check if socket is connected
    if (!socket.connected) {
      console.log("Socket not connected, attempting to reconnect");
      socket.connect();
    }
    
    // Make sure we're in the chat session room
    socket.emit("joinChatSession", currentChatSessionId);
    console.log(`Joined socket room for chat session: ${currentChatSessionId}`);
    
    // Subscribe to new messages
    socket.on("newMessage", (data) => {
      console.log("Received new message via socket:", data);
      
      // Extract the message and chatSessionId from the data
      const chatSessionId = data.chatSessionId || (data.message && data.message.chatSessionId);
      const message = data.message || data;
      
      // Only add the message if it's for the current chat session
      if (chatSessionId && chatSessionId.toString() === currentChatSessionId.toString()) {
        // Make sure we're still in the same chat session when the message arrives
        const currentSession = get().selectedChatSession;
        if (!currentSession || currentSession._id.toString() !== currentChatSessionId.toString()) {
          console.log('Chat session changed, ignoring message');
          return;
        }
        
        set((state) => {
          // Make sure we don't add duplicate messages
          const isDuplicate = state.messages.some(msg => {
            // Check by ID if available
            if (msg._id && message._id) {
              return msg._id === message._id;
            }
            
            // Check by content, sender and timestamp if no ID
            return msg.text === message.text && 
                   msg.sender && message.sender &&
                   msg.sender._id === message.sender._id &&
                   Math.abs(new Date(msg.createdAt || Date.now()) - new Date(message.createdAt || Date.now())) < 5000;
          });
          
          // Skip if duplicate
          if (isDuplicate) {
            console.log("Duplicate message detected, not adding");
            return state;
          }
          
          console.log("Adding new message to state:", message);
          return {
            messages: [...state.messages, message]
          };
        });
        
        // Update the chat sessions list with the new message
        set((state) => ({
          chatSessions: state.chatSessions.map((session) => {
            // Match by either chatSessionId or _id depending on what's available
            const sessionId = session.chatSessionId || session._id;
            if (sessionId && sessionId.toString() === currentChatSessionId.toString()) {
              return {
                ...session,
                lastMessage: message,
                unreadCount: (session.unreadCount || 0) + 1
              };
            }
            return session;
          }),
        }));
      } else {
        console.log("Message is for a different chat session, updating recent messages only");
        // Still update recent messages to show new message indicators
        get().getRecentMessages();
      }
    });

    console.log(`Subscribed to messages for chat session: ${currentChatSessionId}`);
  },

  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Unsubscribe from new messages
    socket.off("newMessage");

    console.log("Unsubscribed from messages");
  },

  // Get all public rooms
  getPublicRooms: async () => {
    try {
      const res = await axiosInstance.get("/public-rooms");
      set({ publicRooms: res.data });
      return res.data;
    } catch (error) {
      console.error("Error getting public rooms:", error);
      return [];
    }
  },

  // Get only the public rooms that the user has joined
  getJoinedPublicRooms: async () => {
    try {
      // We need to get all public rooms and filter by the ones where the user is a participant
      const res = await axiosInstance.get("/public-rooms");
      const allRooms = res.data;

      // Get the current user ID
      const authUser = useAuthStore.getState().authUser;
      if (!authUser || !authUser._id) {
        console.error("No authenticated user found");
        return [];
      }

      // Filter rooms where the current user is a participant
      // This depends on how the API returns participant data
      const joinedRooms = allRooms.filter(room => {
        // Check if the room has participants array and if the user's ID is in it
        return room.participants &&
               Array.isArray(room.participants) &&
               room.participants.some(participant => {
                 // Handle both object and string IDs
                 if (typeof participant === 'string') {
                   return participant === authUser._id;
                 } else if (participant._id) {
                   return participant._id === authUser._id;
                 }
                 return false;
               });
      });

      set({ joinedPublicRooms: joinedRooms });
      return joinedRooms;
    } catch (error) {
      console.error("Error getting joined public rooms:", error);
      return [];
    }
  },

  // Get rooms by category
  getPublicRoomsByCategory: async (category) => {
    try {
      const res = await axiosInstance.get(`/public-rooms/category/${category}`);
      set({ publicRooms: res.data });
      return res.data;
    } catch (error) {
      console.error(`Error getting ${category} rooms:`, error);
      return [];
    }
  },

  // Join a public room
  joinPublicRoom: async (roomId) => {
    try {
      console.log("Joining public room with ID:", roomId);
      
      // Check if we have a token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        toast.error("Please log in again");
        return false;
      }
      
      // Clear any existing private chat selections to avoid conflicts
      set({
        selectedUser: null,
        selectedChatSession: null
      });

      // Join the room
      const res = await axiosInstance.post(`/public-rooms/join/${roomId}`);
      console.log("Joined public room:", res.data);

      // Fetch the room details to set as selectedPublicRoom
      try {
        // Use the endpoint for room details
        const roomDetails = await axiosInstance.get(`/public-rooms/room/${roomId}`);
        console.log("Room details fetched:", roomDetails.data);

        // Set the selected public room in the state
        set({
          selectedPublicRoom: roomDetails.data
        });

        // Get messages for this room
        await useChatStore.getState().getPublicRoomMessages(roomId);

        // Join the socket room
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.emit("joinPublicRoom", roomId);
          console.log("Emitted joinPublicRoom event to socket for room:", roomId);
        } else {
          console.warn("Socket not available, can't join room socket");
        }

        return true;
      } catch (roomError) {
        console.error("Error fetching room details:", roomError);
        toast.error("Failed to get room details");
        return false;
      }
    } catch (error) {
      console.error("Error joining public room:", error);
      toast.error(error.response?.data?.error || "Failed to join room");
      return false;
    }
  },

  // Get messages for a public room
  getPublicRoomMessages: async (roomId) => {
    try {
      if (!roomId) {
        console.error("No room ID provided");
        set({ publicRoomMessages: [] });
        return [];
      }

      set({ isPublicRoomMessagesLoading: true });

      // First unsubscribe from any previous room messages to avoid duplicates
      get().cleanupPublicRoomChat();

      // Use the updated endpoint for room messages
      console.log(`Fetching messages for public room ${roomId}`);
      const res = await axiosInstance.get(`/public-rooms/${roomId}/messages`);
      console.log("Fetched public room messages:", res.data.length, "messages");

      // Ensure we have an array of messages
      const messages = Array.isArray(res.data) ? res.data : [];

      set({ publicRoomMessages: messages });

      // Subscribe to new messages for this room
      const socket = useAuthStore.getState().socket;
      if (socket) {
        // First check if socket is connected
        if (!socket.connected) {
          console.log("Socket not connected, attempting to reconnect");
          socket.connect();
        }

        // Make sure we're in the room
        socket.emit("joinPublicRoom", roomId);
        console.log("Joined socket room for public room:", roomId);
        
        // Remove any existing listeners to prevent duplicates
        socket.off("newRoomMessage");
        
        // Set up listener for new messages
        socket.on("newRoomMessage", (message) => {
          // Only add the message if it's for the current room
          if (message.roomId === roomId) {
            // Make sure we're still in the same room when the message arrives
            const currentRoom = get().selectedPublicRoom;
            if (!currentRoom || currentRoom._id !== roomId) {
              console.log('Room changed, ignoring message');
              return;
            }
            
            set((state) => {
              // Make sure we don't add duplicate messages
              const isDuplicate = state.publicRoomMessages.some(msg => msg._id === message._id);
              if (isDuplicate) return state;
              
              return {
                publicRoomMessages: [...state.publicRoomMessages, message]
              };
            });
          }
        });
      }

      return messages;
    } catch (error) {
      console.error("Error getting public room messages:", error);
      toast.error("Failed to load room messages");
      set({ publicRoomMessages: [] });
      return [];
    } finally {
      set({ isPublicRoomMessagesLoading: false });
    }
  },

  // Send message to a public room
  sendPublicRoomMessage: async ({ roomId, text }) => {
    try {
      if (!roomId || !text) {
        console.error("Missing roomId or text for public room message");
        return null;
      }

      // Get current user info for the temporary message
      const currentUser = useAuthStore.getState().user || useAuthStore.getState().authUser;
      if (!currentUser) {
        console.error("No user found, cannot send message");
        return null;
      }

      // Create a temporary message with current timestamp
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        text,
        sender: currentUser,
        roomId,
        createdAt: new Date().toISOString(),
        isTemp: true, // Flag to identify temporary messages
      };
      
      // Add temporary message to state for immediate feedback
      set((state) => ({
        publicRoomMessages: [...state.publicRoomMessages, tempMessage],
      }));

      // Send the message to the server
      const res = await axiosInstance.post(`/public-rooms/send/${roomId}`, {
        text,
      });

      // Replace the temporary message with the confirmed message from server
      set((state) => ({
        publicRoomMessages: state.publicRoomMessages
          .filter((msg) => msg._id !== tempId)
          .concat(res.data)
      }));

      return res.data;
    } catch (error) {
      console.error("Error sending public room message:", error);
      toast.error("Failed to send message");

      // Remove the temporary message on error
      set((state) => ({
        publicRoomMessages: state.publicRoomMessages.filter(
          (msg) => !msg.isTemp
        ),
      }));

      return null;
    }
  },

  // Set selected public room
  setSelectedPublicRoom: (room) => set({ selectedPublicRoom: room }),

  // Get participants for a public room
  getPublicRoomParticipants: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/public-rooms/${roomId}/participants`);
      return res.data;
    } catch (error) {
      console.error("Error fetching room participants:", error);
      toast.error("Failed to load room participants");
      return [];
    }
  },

  // Leave a public room
  leavePublicRoom: async (roomId) => {
    try {
      console.log("Leaving public room with ID:", roomId);

      // Leave the room via API
      const res = await axiosInstance.post(`/public-rooms/leave/${roomId}`);
      console.log("Left public room:", res.data);

      // If the room we're leaving is the currently selected room, clear it
      if (get().selectedPublicRoom && get().selectedPublicRoom._id === roomId) {
        // Clean up socket listeners first
        get().cleanupPublicRoomChat();

        set({
          selectedPublicRoom: null,
          publicRoomMessages: []
        });
      }

      // Refresh the list of joined rooms
      await get().getJoinedPublicRooms();

      toast.success("Left the room successfully");
      return true;
    } catch (error) {
      console.error("Error leaving public room:", error);
      toast.error(error.response?.data?.error || "Failed to leave room");
      return false;
    }
  }
}));
