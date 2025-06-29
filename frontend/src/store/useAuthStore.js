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
      set({ authUser: res.data });
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
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket()
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
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
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
