import { create } from "zustand";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set,get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.messages);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.messages);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async(messageData) => {
    const {selectedUser,messages} = get()

    try {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData)
        set({messages:[...messages,res.data]})

    } catch (error) {
       let message = "Failed to send message";
       if (error.response?.status === 413 || error.message?.includes("413") || error.message === "Network Error") {
         message = "Image is too big to upload. Please select a smaller image.";
       } else if (error.response?.data?.messages) {
         message = error.response.data.messages;
       }
       toast.error(message);
     }
  },
  subscribeToMessages: () => {
    const {selectedUser} = get()
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket
    socket.on("newMessage", (newMessage) => {
      set ({ 
        messages: [...get().messages, newMessage]
      })
    })

  },
  unsubscribeToMessages: () => {
    const socket = useAuthStore.getState().socket
    socket.off("newMessage")

  },
  //todo optimze this one later
  setSelectedUser: async (selectedUser) => set({ selectedUser }),
}));
