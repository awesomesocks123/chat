import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Users, MessagesSquare, Shuffle } from "lucide-react";
// Simple function to format time ago
const formatTimeAgo = (date) => {
  // Check if date is valid
  if (!date || isNaN(date.getTime())) {
    console.warn("Invalid date provided to formatTimeAgo:", date);
    return "just now";
  }

  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    // Use a safer date formatting approach
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  } catch (error) {
    console.error("Error formatting time ago:", error);
    return "just now";
  }
};

const SideBar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    isUsersLoading,
    getFriends,
    friends,
    getActiveChats,
    activeChats,
    viewMode,
    setViewMode,
    getRandomUser,
    chatSessions,
    getChatSessions,
    getMessages,
    selectedChatSession,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    getUsers();
    getFriends();
    getActiveChats();
    getChatSessions();
  }, [getUsers, getFriends, getActiveChats, getChatSessions]);

  // Listen for online users from socket
  useEffect(() => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      // Listen for online users updates
      socket.on("getOnlineUsers", (users) => {
        console.log("Online users:", users);
        setOnlineUsers(users);
      });

      // Request online users on mount
      socket.emit("getOnlineUsers");

      return () => {
        socket.off("getOnlineUsers");
      };
    }
  }, []);

  const handleRandomChat = async () => {
    setIsRandomLoading(true);
    console.log("Starting random chat matching...");
    try {
      const randomUser = await getRandomUser();
      console.log("Random user returned to SideBar:", randomUser);

      if (randomUser && randomUser.fullName) {
        console.log(
          "Found user with name:",
          randomUser.fullName,
          "ID:",
          randomUser._id
        );
        toast.success(`Connected with ${randomUser.fullName}`);
      } else if (randomUser) {
        console.log("Found user but missing name:", randomUser);
        toast.success("Connected with a new user");
      } else {
        console.log("No random user returned");
      }
    } catch (error) {
      console.error("Error getting random chat", error);
      toast.error("Could not find a match");
    } finally {
      setIsRandomLoading(false);
    }
  };

  const handleUserSelect = async (item) => {
    if (viewMode === "chats") {
      // Set the selected user to the other user in the chat session
      setSelectedUser(item.otherUser);
      // Set the selected chat session
      useChatStore.getState().setSelectedChatSession(item);
      // Get messages for this chat session
      getMessages(item._id);
    } else {
      // For friends view, item is a user/friend object
      setSelectedUser(item);
      // Create or get a chat session with this user
      try {
        // Use the existing endpoint that gets or creates a chat session with a user
        const res = await axiosInstance.get(`/chat-sessions/${item._id}`);
        if (res.data) {
          console.log("Got chat session for friend:", res.data);
          useChatStore.getState().setSelectedChatSession(res.data);
          getMessages(res.data._id);
        }
      } catch (error) {
        console.error("Error getting chat session for friend", error);
        toast.error("Failed to load chat with this friend");
      }
    }
  };

  if (isUsersLoading) return <div>Loading...</div>;

  return (
    <div className="border-r border-r-base-300 p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("chats")}
            className={`btn btn-sm ${viewMode === "chats" ? "btn-primary" : "btn-ghost"}`}
          >
            <MessagesSquare className="w-4 h-4" />
            Chats
          </button>
          <button
            onClick={() => setViewMode("friends")}
            className={`btn btn-sm ${viewMode === "friends" ? "btn-primary" : "btn-ghost"}`}
          >
            <Users className="w-4 h-4" />
            Friends
          </button>
        </div>
        <button
          className={`btn btn-circle btn-sm items-center ${isRandomLoading ? "loading" : ""}`}
          onClick={handleRandomChat}
          disabled={isRandomLoading}
        >
          <Shuffle className="w-4 h-4" />
        </button>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="input input-bordered w-full pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <i className="i-search absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50"></i>
      </div>

      <div className="overflow-y-auto flex-1">
        {viewMode === "chats" ? (
          // Display chat sessions
          Array.isArray(chatSessions) && chatSessions.length > 0 ? (
            chatSessions
              .filter((session) => {
                // Find the other user in the participants
                const otherUser = session.participants?.find(
                  (user) => user?._id !== authUser?._id
                );
                return otherUser?.fullName
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase());
              })
              .map((session) => {
                const isSelected = selectedChatSession?._id === session._id;

                // Find the other user in the participants if otherUser is not set
                let otherUser = session.otherUser;
                if (!otherUser && session.participants) {
                  otherUser =
                    session.participants.find(
                      (user) => user?._id !== authUser?._id
                    ) || {};
                }

                // Skip rendering if we can't determine the other user
                if (!otherUser) {
                  console.log("Missing otherUser for session:", session);
                  return null;
                }

                return (
                  <div
                    key={session._id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 ${isSelected ? "bg-base-200" : ""}`}
                    onClick={() => handleUserSelect(session)}
                  >
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img
                          src={otherUser.profilePic || "/avatar.png"}
                          alt={otherUser.fullName || "User"}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">
                          {otherUser.fullName || "User"}
                        </div>
                        {otherUser &&
                          otherUser._id &&
                          Array.isArray(onlineUsers) &&
                          onlineUsers.includes(otherUser._id) && (
                            <div className="badge badge-xs badge-success" />
                          )}
                      </div>
                      {session.lastMessage && (
                        <p className="text-xs text-base-content/70 truncate">
                          {session.lastMessage.text || "Sent an image"}
                        </p>
                      )}
                    </div>
                    {session.lastMessage && (
                      <div className="text-xs text-base-content/50">
                        {session.lastMessage.createdAt &&
                        !isNaN(new Date(session.lastMessage.createdAt))
                          ? formatTimeAgo(
                              new Date(session.lastMessage.createdAt)
                            )
                          : "Just now"}
                      </div>
                    )}
                  </div>
                );
              })
          ) : (
            <p className="text-center text-base-content/50 mt-4">
              No active chats
            </p>
          )
        ) : // Display friends
        Array.isArray(friends) && friends.length > 0 ? (
          friends
            .filter((user) =>
              user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((user) => (
              <div
                key={user._id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-base-200 ${selectedUser?._id === user._id ? "bg-base-200" : ""}`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.fullName}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium">{user.fullName}</h3>
                  <p className="text-xs text-base-content/70">{user.email}</p>
                </div>
              </div>
            ))
        ) : (
          <p className="text-center text-base-content/50 mt-4">
            No friends yet
          </p>
        )}
      </div>
    </div>
  );
};

export default SideBar;
