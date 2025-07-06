import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const usePublicRoomStore = create((set, get) => ({
  // State
  publicRooms: [],
  joinedPublicRooms: [],
  selectedPublicRoom: null,
  publicRoomMessages: [],
  isPublicRoomMessagesLoading: false,
  publicRoomParticipants: [],

  // Get all public rooms
  getPublicRooms: async () => {
    try {
      const res = await axiosInstance.get("/public-rooms");
      set({ publicRooms: res.data });
      return res.data;
    } catch (error) {
      console.error("Error fetching public rooms:", error);
      toast.error("Failed to load public rooms");
      return [];
    }
  },

  // Get only the public rooms that the user has joined
  getJoinedPublicRooms: async () => {
    try {
      // Get all public rooms first
      const res = await axiosInstance.get("/public-rooms");
      
      // Filter to only include rooms where the current user is a participant
      const { authUser } = useAuthStore.getState();
      const joinedRooms = res.data.filter(room => 
        room.participants && 
        room.participants.some(participant => 
          participant._id === authUser._id || 
          participant === authUser._id
        )
      );
      
      set({ joinedPublicRooms: joinedRooms });
      return joinedRooms;
    } catch (error) {
      console.error("Error fetching joined public rooms:", error);
      toast.error("Failed to load your rooms");
      return [];
    }
  },

  // Get rooms by category
  getPublicRoomsByCategory: async (category) => {
    try {
      const res = await axiosInstance.get(`/public-rooms/category/${category}`);
      return res.data;
    } catch (error) {
      console.error(`Error fetching ${category} rooms:`, error);
      toast.error(`Failed to load ${category} rooms`);
      return [];
    }
  },

  // Join a public room
  joinPublicRoom: async (roomId) => {
    try {
      // Join the room via API
      await axiosInstance.post(`/public-rooms/join/${roomId}`);
      
      // Fetch room details
      const roomDetails = await axiosInstance.get(`/public-rooms/room/${roomId}`);
      
      // Set as selected room
      set({ selectedPublicRoom: roomDetails.data });
      
      // Fetch messages for this room
      await get().getPublicRoomMessages(roomId);
      
      // Join socket room
      const socket = useAuthStore.getState().socket;
      if (socket) {
        socket.emit("joinPublicRoom", roomId);
      }
      
      // Update joined rooms list
      get().getJoinedPublicRooms();
      
      return true;
    } catch (error) {
      console.error("Error joining public room:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to join room");
      }
      return false;
    }
  },

  // Subscribe to room messages
  subscribeToRoomMessages: (roomId) => {
    console.log(`Subscribing to messages for room ${roomId}`);
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    
    // First check if socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Make sure we're in the room
    socket.emit("joinPublicRoom", roomId);
    
    // Remove any existing listeners to prevent duplicates
    socket.off("newRoomMessage");
    
    // Set up listener for new messages
    socket.on("newRoomMessage", (message) => {
      console.log("Received new room message:", message);
      // Only add the message if it's for the current room
      if (message.roomId === roomId) {
        // Make sure we're still in the same room when the message arrives
        const currentRoom = get().selectedPublicRoom;
        if (!currentRoom || currentRoom._id !== roomId) {
          return;
        }
        
        set((state) => {
          // Check for duplicates by ID or by comparing with optimistic messages
          const isDuplicate = state.publicRoomMessages.some(msg => 
            // Check by ID
            msg._id === message._id ||
            // Check if this is a real message that matches an optimistic one
            (msg.isOptimistic && 
             msg.text === message.text && 
             msg.sender._id === message.sender._id &&
             // Time difference less than 5 seconds
             Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 5000)
          );
          
          if (isDuplicate) {
            console.log("Duplicate message detected, not adding");
            return state;
          }
          
          console.log("Adding new message to state");
          return {
            publicRoomMessages: [...state.publicRoomMessages, message]
          };
        });
      }
    });
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

      // Fetch messages from API
      const res = await axiosInstance.get(`/public-rooms/${roomId}/messages`);
      
      // Ensure we have an array of messages
      const messages = Array.isArray(res.data) ? res.data : [];
      set({ 
        publicRoomMessages: messages,
        isPublicRoomMessagesLoading: false 
      });

      // Subscribe to new messages for this room
      get().subscribeToRoomMessages(roomId);

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
        console.error("Room ID and message text are required");
        return false;
      }

      // Get current user
      const { authUser } = useAuthStore.getState();
      if (!authUser) {
        console.error("User not authenticated");
        return false;
      }

      // Create optimistic message
      const optimisticId = Date.now().toString();
      const optimisticMessage = {
        _id: optimisticId,
        sender: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
        text,
        roomId,
        createdAt: new Date().toISOString(),
        isOptimistic: true // Flag to identify optimistic messages
      };
      
      set((state) => ({
        publicRoomMessages: [...state.publicRoomMessages, optimisticMessage],
      }));
      
      // Make API call to send message
      console.log(`Making POST request to /public-rooms/send/${roomId}`);
      const res = await axiosInstance.post(`/public-rooms/send/${roomId}`, { text });
      
      // Replace optimistic message with real message
      set((state) => ({
        publicRoomMessages: state.publicRoomMessages.map(msg => 
          msg._id === optimisticId ? { ...res.data, isOptimistic: false } : msg
        )
      }));
      
      // Make sure we're subscribed to room messages
      get().subscribeToRoomMessages(roomId);
      
      return res.data;
    } catch (error) {
      console.error("Error sending message to public room:", error);
      toast.error("Failed to send message. Please try again.");
      
      // Remove optimistic message on error
      set((state) => ({
        publicRoomMessages: state.publicRoomMessages.filter(
          (msg) => msg._id !== optimisticId
        ),
      }));
      
      throw error;
    }
  },

  // Set selected public room
  setSelectedPublicRoom: (room) => set({ selectedPublicRoom: room }),

  // Get participants for a public room
  getPublicRoomParticipants: async (roomId) => {
    try {
      const res = await axiosInstance.get(`/public-rooms/${roomId}/participants`);
      set({ publicRoomParticipants: res.data });
      return res.data;
    } catch (error) {
      console.error("Error getting public room participants:", error);
      toast.error("Failed to load participants");
      set({ publicRoomParticipants: [] });
      return [];
    }
  },

  // Leave a public room
  leavePublicRoom: async (roomId) => {
    try {
      await axiosInstance.post(`/public-rooms/leave/${roomId}`);
      
      // Clean up socket listeners
      get().cleanupPublicRoomChat();
      
      // If this was the selected room, clear it
      if (get().selectedPublicRoom && get().selectedPublicRoom._id === roomId) {
        set({ 
          selectedPublicRoom: null,
          publicRoomMessages: [],
          publicRoomParticipants: []
        });
      }
      
      // Update joined rooms list
      get().getJoinedPublicRooms();
      
      toast.success("Left room successfully");
      return true;
    } catch (error) {
      console.error("Error leaving public room:", error);
      toast.error("Failed to leave room");
      return false;
    }
  },

  // Clean up socket listeners and leave room
  cleanupPublicRoomChat: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    console.log("Cleaning up public room chat");
    
    // Remove event listener
    socket.off("newRoomMessage");

    // Leave the public room if we have one
    if (get().selectedPublicRoom && get().selectedPublicRoom._id) {
      const roomId = get().selectedPublicRoom._id;
      console.log(`Leaving public room: ${roomId}`);
      socket.emit("leavePublicRoom", roomId);
    }
  },

  // Reset all public room state
  resetPublicRoomState: () => {
    get().cleanupPublicRoomChat();
    set({
      selectedPublicRoom: null,
      publicRoomMessages: [],
      publicRoomParticipants: []
    });
  }
}));
