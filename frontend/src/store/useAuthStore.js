import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import axios from "axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (error) {
      console.log("error in checkAuth", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  signup: async (data) => {
    console.log("Sending signup data to backend:", data); // 🧪
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);
      console.log("Signup response:", res.data); // 🧪

      set({ authUser: res.data });
      toast.success("Account created successfully");
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || "Signup failed";
      toast.error(errMsg);
      console.error("Signup error:", error); // 🧪
    } finally {
      set({ isSigningUp: false });
    }
  },
}));
