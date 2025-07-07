import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set,get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket:null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket()
    } catch (error) {
      console.log("error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      
      // Store the user data
      set({ authUser: res.data.user || res.data });
      
      // Store the token if it exists
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      
      toast.success("Account created successfully");
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || "Signup failed";
      toast.error(errMsg);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      // Store user data
      set({ authUser: res.data.user || res.data });
      
      // Store the token if it exists
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        console.log('Token stored in localStorage:', res.data.token);
      }
      
      toast.success("Logged in successfully");
      get().connectSocket();
      
      // Add a small delay before refreshing to ensure state is updated
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || "Log in failed";
      toast.error(errMsg);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  connectSocket: () => {
    const {authUser} = get()
    if (!authUser || get().socket?.connected) return;


    const socket = io(BASE_URL,{
      query: {
        userId: authUser._id,
      },
    })

    socket.connect();
    set({ socket: socket }); 

    socket.on("getOnlineUsers", (usersIds) => {
      set({ onlineUsers: usersIds });
    });
    
    // Listen for friend request events
    socket.on("friendRequest", (data) => {
      toast.success(`New friend request from ${data.user.fullName || data.user.username}`);
      // Update friend requests in the chat store
      import("./useChatStore").then(module => {
        const useChatStore = module.useChatStore;
        useChatStore.getState().getReceivedFriendRequests();
      });
    });
    
    socket.on("friendRequestAccepted", (data) => {
      toast.success(`${data.user.fullName || data.user.username} accepted your friend request!`);
      // Update friends list and requests in the chat store
      import("./useChatStore").then(module => {
        const useChatStore = module.useChatStore;
        useChatStore.getState().getFriends();
        useChatStore.getState().getSentFriendRequests();
      });
    });
    
    socket.on("friendRequestDeclined", () => {
      // Update sent requests in the chat store
      import("./useChatStore").then(module => {
        const useChatStore = module.useChatStore;
        useChatStore.getState().getSentFriendRequests();
      });
    });
    
    socket.on("friendRequestCancelled", () => {
      // Update received requests in the chat store
      import("./useChatStore").then(module => {
        const useChatStore = module.useChatStore;
        useChatStore.getState().getReceivedFriendRequests();
      });
    })
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null });
  },


  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      toast.success("Logged out successfully");
      get().disconnectSocket();
      
      // Add a small delay before refreshing to ensure state is updated
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error logging out");
      
      // Clear token even if logout API fails
      localStorage.removeItem('token');
    }
  },
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Fail to update profile";
      toast.error(errMsg);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
}));
