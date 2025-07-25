import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { usePublicRoomStore } from "../store/usePublicRoomStore";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Users, MessagesSquare, Shuffle, Trash2, MessageSquare, LogOut, UserPlus, Bell, Check, X } from "lucide-react";
import FriendRequests from "./FriendRequests";

// Enhanced function to format time ago
const formatTimeAgo = (date) => {
  // Check if date is valid
  if (!date || isNaN(date.getTime())) {
    console.warn("Invalid date provided to formatTimeAgo:", date);
    return "just now";
  }

  try {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

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

const SideBar = ({ toggleSidebar }) => {
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
    deleteChatSession,
    receivedFriendRequests,
    getReceivedFriendRequests,
  } = useChatStore();
  
  // Add state for sidebar tabs
  const [activeTab, setActiveTab] = useState("private"); // "private", "rooms", or "friends"
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    getPublicRooms,
    publicRooms,
    joinedPublicRooms,
    getJoinedPublicRooms,
    setSelectedPublicRoom,
    selectedPublicRoom,
    joinPublicRoom,
  } = usePublicRoomStore();

  const { authUser } = useAuthStore();
  const [isRandomLoading, setIsRandomLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Helper function to check if a user is a friend
  const isFriend = (userId) => {
    return friends && Array.isArray(friends) && friends.some(friend => friend._id === userId);
  };
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    getUsers();
    getFriends();
    getActiveChats();
    // Use the new getRecentMessages function instead of getChatSessions
    useChatStore.getState().getRecentMessages();
    // Get public rooms and joined public rooms
    getPublicRooms();
    // Get only the rooms the user has joined
    getJoinedPublicRooms();
    // Get friend requests
    getReceivedFriendRequests();
  }, [getUsers, getFriends, getActiveChats, getPublicRooms, getJoinedPublicRooms, getReceivedFriendRequests]);

  // Handle clicks outside the private dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Listen for online users and new chat sessions from socket
  useEffect(() => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      // Listen for online users updates
      socket.on("getOnlineUsers", (users) => {
        console.log("Online users:", users);
        setOnlineUsers(users);
      });

      // Listen for new chat sessions (from random matching)
      socket.on("newChatSession", (data) => {
        console.log("Received new chat session:", data);
        toast.success(`New chat from ${isFriend(data.user._id) ? data.user.fullName : data.user.username}`);
        
        // Process the new chat session
        const processedSession = useChatStore.getState().processChatSession(data.chatSession);
        
        if (processedSession) {
          // Update the chat sessions list
          useChatStore.setState(state => ({
            chatSessions: [processedSession, ...state.chatSessions]
          }));
        }
      });

      // Request online users on mount
      socket.emit("getOnlineUsers");

      return () => {
        socket.off("getOnlineUsers");
        socket.off("newChatSession");
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
        toast.success(`Connected with ${isFriend(randomUser._id) ? randomUser.fullName : randomUser.username}`);
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
    // First, clear any existing selections to avoid conflicts
    if (viewMode === "chats") {
      // Clear public room selection first
      setSelectedPublicRoom(null);
      
      // Set the selected user to the other user in the recent message
      setSelectedUser(item.otherUser);
      
      // Get messages for this chat session using the chatSessionId
      const chatSessionId = item.chatSessionId;
      
      try {
        // Mark messages as read when selecting a chat
        if (item.unreadCount > 0) {
          await axiosInstance.post(`/users/mark-read/${chatSessionId}`);
          
          // Update the unread count in the local state
          useChatStore.setState(state => ({
            chatSessions: state.chatSessions.map(session => 
              session.chatSessionId === chatSessionId 
                ? { ...session, unreadCount: 0 }
                : session
            )
          }));
        }
        
        // Get the full chat session details
        const sessionRes = await axiosInstance.get(`/chat-sessions/session/${chatSessionId}`);
        const fullChatSession = sessionRes.data;
        
        // Set the selected chat session
        useChatStore.getState().setSelectedChatSession(fullChatSession);
        
        // Get messages for this chat session
        getMessages(chatSessionId);
      } catch (error) {
        console.error("Error loading chat session:", error);
        toast.error("Failed to load chat session");
      }
    } else if (viewMode === "chatrooms") {
      // For chatrooms view, item is a public room object
      try {
        // Clear private chat selections first
        setSelectedUser(null);
        useChatStore.getState().setSelectedChatSession(null);
        
        // Join the room
        await joinPublicRoom(item._id);
        
        // Set selected public room
        setSelectedPublicRoom(item);
      } catch (error) {
        console.error("Error joining public room:", error);
        toast.error("Failed to join public room");
      }
    } else {
      // For friends view, item is a user/friend object
      // Clear public room selection first
      setSelectedPublicRoom(null);
      
      setSelectedUser(item);
      // Create or get a chat session with this user
      try {
        // Use the existing endpoint that gets or creates a chat session with a user
        const res = await axiosInstance.get(`/chat-sessions/user/${item._id}`);
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

  const handleDeleteChatSession = async (chatSessionId) => {
    try {
      const success = await deleteChatSession(chatSessionId);
      if (success) {
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error("Error deleting chat session:", error);
    }
  };

  if (isUsersLoading) return <div>Loading...</div>;

  return (
    <div className="border-r border-r-base-300 p-4 flex flex-col h-full w-full">
      {/* Mobile view indicator - only visible on small screens */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <div className="space-y-3 mb-6">
        {/* Top row with Private and Friends buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div ref={dropdownRef} className="relative">
            <button 
              className={`btn btn-sm w-full ${viewMode === "chats" || viewMode === "chatrooms" ? "btn-primary" : "btn-primary"}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {viewMode === "chats" ? (
                <>
                  <MessagesSquare className="w-4 h-4 mr-1" />
                  Private
                </>
              ) : viewMode === "chatrooms" ? (
                <>
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <MessagesSquare className="w-4 h-4 mr-1" />
                  Private
                </>
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-base-100 shadow rounded-box z-50">
                <ul className="menu p-2">
                  <li>
                    <button 
                      onClick={() => {
                        setViewMode("chats");
                        setDropdownOpen(false);
                      }} 
                      className="w-full text-left flex items-center gap-2"
                    >
                      <MessagesSquare className="w-4 h-4" />
                      Private Chats
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        setViewMode("chatrooms");
                        setDropdownOpen(false);
                      }} 
                      className="w-full text-left flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Public Rooms
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button
            onClick={() => setViewMode("friends")}
            className={`btn btn-sm w-full btn-primary relative`}
          >
            <Users className="w-4 h-4 mr-1" />
            Friends
            {receivedFriendRequests.length > 0 && (
              <span className="badge badge-sm badge-error absolute -top-2 -right-2">
                {receivedFriendRequests.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Bottom row with Shuffle Chat button */}
        <div className="w-full">
          <button
            className={`btn btn-sm w-full ${isRandomLoading ? "loading" : ""} btn-outline btn-neutral`}
            onClick={() => {
              handleRandomChat();
              // On mobile, switch to chat view after finding a match
              if (window.innerWidth < 768) {
                setTimeout(() => toggleSidebar(), 1000);
              }
            }}
            disabled={isRandomLoading}
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Shuffle Chat
          </button>
        </div>
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
        {viewMode === "friends" ? (
          <div className="space-y-4">
            {/* Show friend requests at the top of friends list */}
            {receivedFriendRequests.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Pending Requests ({receivedFriendRequests.length})
                </h3>
                <div className="space-y-2">
                  {receivedFriendRequests.map((user) => (
                    <div 
                      key={user._id} 
                      className="flex items-center justify-between p-2 bg-base-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className="truncate">
                          <p className="font-medium text-sm">{user.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className="btn btn-xs btn-circle btn-success"
                          onClick={() => {
                            useChatStore.getState().acceptFriendRequest(user._id);
                          }}
                          title="Accept Request"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          className="btn btn-xs btn-circle btn-error"
                          onClick={() => {
                            useChatStore.getState().declineFriendRequest(user._id);
                          }}
                          title="Decline Request"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Friends list */}
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Friends ({friends.length})
            </h3>
            {Array.isArray(friends) && friends.length > 0 ? (
              friends
                .filter((user) =>
                  (user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || user?.username?.toLowerCase().includes(searchTerm.toLowerCase()))
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
                          alt={user.fullName || "User"}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium flex items-center gap-2">
                          {isFriend(user._id) ? user.fullName : user.username || "User"}
                          {user._id && Array.isArray(onlineUsers) && onlineUsers.includes(user._id) && (
                            <div className="status status-lg status-success" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-base-content/70">
                        {user.email || "No email"}
                      </p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-center text-base-content/50 mt-4">
                You don't have any friends yet
              </p>
            )}
          </div>
        ) : viewMode === "chats" ? (
          // Display recent messages from the hybrid approach
          Array.isArray(chatSessions) && chatSessions.length > 0 ? (
            chatSessions
              .filter((recentMsg) => {
                // Filter by search term if we have otherUser data
                if (!recentMsg.otherUser) return true;
                
                return isFriend(recentMsg.otherUser._id) ? recentMsg.otherUser.fullName : recentMsg.otherUser.username
                  ?.toLowerCase()
                  .includes(searchTerm.toLowerCase());
              })
              .map((recentMsg) => {
                const isSelected = selectedChatSession?._id === recentMsg.chatSessionId;
                const otherUser = recentMsg.otherUser;
                
                // Skip rendering if we can't determine the other user
                if (!otherUser) {
                  console.log("Missing otherUser for recent message:", recentMsg);
                  return null;
                }

                return (
                  <div key={recentMsg.chatSessionId}>
                    <div
                      className={`flex items-center gap-2 p-2 rounded-lg hover:bg-base-200 ${isSelected ? "bg-base-200" : ""}`}
                    >
                      <div 
                        className="flex-1 flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                          handleUserSelect(recentMsg);
                          if (window.innerWidth < 768) {
                            toggleSidebar();
                          }
                        }}
                      >
                        <div className="avatar relative">
                          <div className="w-10 rounded-full">
                            <img
                              src={otherUser.profilePic || "/avatar.png"}
                              alt={otherUser.fullName || "User"}
                            />
                          </div>
                          {otherUser._id && Array.isArray(onlineUsers) && onlineUsers.includes(otherUser._id) && (
                            <div className="status status-sm status-success absolute bottom-0 right-0 border-2 border-base-100" />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between w-full">
                            <div className="font-medium truncate max-w-[70%]">
                              {isFriend(otherUser._id) ? otherUser.fullName : otherUser.username || "User"}
                            </div>
                            {recentMsg.unreadCount > 0 && (
                              <div className="badge badge-sm badge-primary">{recentMsg.unreadCount}</div>
                            )}
                          </div>
                          {recentMsg.lastMessage && (
                            <div className="flex justify-between items-center w-full">
                              <p className="text-xs text-base-content/70 truncate">
                                {recentMsg.lastMessage.text || "Sent an image"}
                              </p>
                              <div className="text-xs text-base-content/50 whitespace-nowrap ml-1 min-w-[45px] text-right">
                                {recentMsg.lastMessage.createdAt &&
                                !isNaN(new Date(recentMsg.lastMessage.createdAt))
                                  ? formatTimeAgo(new Date(recentMsg.lastMessage.createdAt))
                                  : "now"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-base-300 opacity-30 mt-1"></div>
                  </div>
                );
              })
          ) : (
            <p className="text-center text-base-content/50 mt-4">
              No active chats
            </p>
          )
        ) : viewMode === "chatrooms" ? (
          // Display only joined public chatrooms
          <div className="space-y-2">
            {joinedPublicRooms.filter((room) => {
                if (!searchTerm) return true;
                return (
                  room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  room.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                );
              })
              .map((room) => {
                const isActive = selectedPublicRoom && selectedPublicRoom._id === room._id;
                const lastMessage = room.lastMessage;
                
                return (
                  <div key={room._id}>
                    <div
                      className={`flex items-center p-2 rounded-lg ${isActive ? "bg-primary text-primary-content" : "hover:bg-base-200"}`}
                    >
                    <div 
                      className="flex-1 flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        handleUserSelect(room);
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h3 className={`font-medium truncate ${isActive ? "text-primary-content" : ""}`}>
                            {room.name}
                          </h3>
                          <span className="text-xs whitespace-nowrap">
                            {room.participants?.length || 0} 
                            <Users className="inline w-3 h-3 ml-1" />
                          </span>
                        </div>
                        {lastMessage && (
                          <p className={`text-xs truncate ${isActive ? "text-primary-content/80" : "text-base-content/70"}`}>
                            {lastMessage.sender?.username || "Unknown"}: {lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                    <button 
                      className="btn btn-ghost btn-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        usePublicRoomStore.getState().leavePublicRoom(room._id);
                      }}
                      title="Leave room"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                    </div>
                    <div className="border-b border-base-300 opacity-30 mt-1"></div>
                  </div>
                );
              })}

            {joinedPublicRooms.length === 0 && (
              <div className="p-4 text-center text-base-content/70">
                You haven't joined any chatrooms yet. <br/>
                <a href="/explore" className="text-primary hover:underline">Explore chatrooms</a> to join one.
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SideBar;
