import React, { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { ChevronLeft, UserPlus, UserCheck, X, Info, AlertTriangle, Flag, UserX, Trash2, Users, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
const ChatHeader = ({ toggleSidebar, isPublicRoom, roomName, toggleParticipants }) => {
  const { 
    selectedUser, 
    setSelectedUser, 
    addFriend, 
    friends, 
    getFriends, 
    selectedChatSession, 
    setSelectedChatSession,
    deleteChatSession,
    selectedPublicRoom,
    setSelectedPublicRoom,
    leavePublicRoom,
    sentFriendRequests,
    getSentFriendRequests
  } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [isFriend, setIsFriend] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  
  // Load sent friend requests when component mounts
  useEffect(() => {
    getSentFriendRequests();
  }, [getSentFriendRequests]);
  
  useEffect(() => {
    // Check if selected user is already a friend
    if (selectedUser && Array.isArray(friends)) {
      const friendIds = friends.map(friend => friend._id);
      setIsFriend(friendIds.includes(selectedUser._id));
    } else {
      setIsFriend(false);
    }
    
    // Check if a friend request has been sent to this user
    if (selectedUser && Array.isArray(sentFriendRequests)) {
      const sentRequestIds = sentFriendRequests.map(request => request._id);
      setRequestSent(sentRequestIds.includes(selectedUser._id));
    } else {
      setRequestSent(false);
    }
  }, [selectedUser, friends, sentFriendRequests]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.info-dropdown')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  const handleReportSubmit = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }
    
    try {
      // Call the reportUser function from the store
      const success = await useChatStore.getState().reportUser(selectedUser._id, reportReason);
      
      if (success) {
        // Close the modal and reset the form
        setShowReportModal(false);
        setReportReason("");
      }
    } catch (error) {
      console.error("Error reporting user:", error);
      toast.error("Failed to report user");
    }
  };
  
  const handleBlockUser = async () => {
    try {
      if (selectedUser) {
        // Call the blockUser function from the store
        const success = await useChatStore.getState().blockUser(selectedUser._id);
        
        if (success) {
          // The blockUser function already handles clearing the selected user and chat session
          // Close the modal
          setShowBlockModal(false);
        }
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
    }
  };
  
  const handleDeleteChat = async () => {
    try {
      if (selectedChatSession) {
        await deleteChatSession(selectedChatSession._id);
        toast.success("Chat deleted successfully");
        
        // Reset the selected user and chat session
        setSelectedUser(null);
        setSelectedChatSession(null);
      }
      
      // Close the modal
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat");
    }
  };
  // Handle leaving a public room
  const handleLeaveRoom = async () => {
    if (selectedPublicRoom) {
      try {
        await leavePublicRoom(selectedPublicRoom._id);
        toast.success(`Left ${selectedPublicRoom.name}`);
        setSelectedPublicRoom(null);
      } catch (error) {
        console.error("Error leaving room:", error);
        toast.error("Failed to leave room");
      }
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button - only visible on mobile */}
          <button 
            onClick={toggleSidebar} 
            className="md:hidden btn btn-sm btn-ghost btn-circle"
          >
            <ChevronLeft size={20} />
          </button>
          
          {/* Public Room Icon or User Avatar */}
          {isPublicRoom ? (
            <div className="avatar">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-content">
                <MessageSquare size={20} />
              </div>
            </div>
          ) : selectedUser && (
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.fullName}
                />
              </div>
            </div>
          )}
          
          {/* Room Info or User Info */}
          {isPublicRoom ? (
            <div>
              <h3 className="font-medium">{roomName || selectedPublicRoom?.name}</h3>
              <p className="text-xs text-base-content/70">
                {selectedPublicRoom?.category} • Public Room
              </p>
            </div>
          ) : selectedUser && (
            <div>
              <h3 className="font-medium">
                {isFriend ? selectedUser.fullName : selectedUser.username}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className={`${(onlineUsers ?? []).includes(selectedUser?._id) 
                  ? "status status-md status-success animate-pulse" 
                  : "status status-md status-gray-500 opacity-50"}` }></div>
                <p className={`text-xs ${(onlineUsers ?? []).includes(selectedUser?._id) 
                  ? "text-success font-medium" 
                  : "text-base-content/50"}`}>
                  {(onlineUsers ?? []).includes(selectedUser?._id)
                    ? "Online"
                    : "Offline"}
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Public Room Controls */}
          {isPublicRoom && (
            <>
              <button
                className="btn btn-sm btn-ghost"
                onClick={toggleParticipants}
              >
                <Users size={16} />
                <span className="hidden md:inline">Participants</span>
              </button>
              
              <button
                className="btn btn-sm btn-ghost text-error"
                onClick={handleLeaveRoom}
              >
                <X size={16} />
                <span className="hidden md:inline">Leave</span>
              </button>
            </>
          )}
          
          {/* Private Chat Controls */}
          {!isPublicRoom && (
            <>
              {/* Add to Friends button */}
              {selectedUser && !isFriend ? (
                <button
                  className="btn btn-sm btn-outline btn-primary"
                  onClick={async () => {
                    setIsAdding(true);
                    await addFriend(selectedUser._id);
                    await getFriends();
                    setIsAdding(false);
                  }}
                  disabled={isAdding}
                >
                  <UserPlus size={16} className={isAdding ? "animate-spin" : ""} />
                  <span className="hidden md:inline">Add Friend</span>
                </button>
              ) : selectedUser && isFriend ? (
                <button className="btn btn-sm btn-ghost btn-disabled">
                  <UserCheck size={16} className="text-success" />
                  <span className="hidden md:inline">Friends</span>
                </button>
              ) : null}
              
              {/* Info button with dropdown */}
              {selectedUser && selectedChatSession && (
                <div className="relative info-dropdown">
                  <button
                    className="btn btn-sm btn-ghost btn-circle hover:bg-base-200 hover:text-primary transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <Info size={16} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-base-100 shadow-lg rounded-lg z-50 border border-base-300">
                      <ul className="menu p-2 text-sm">
                        <li>
                          <button 
                            onClick={() => {
                              setShowDropdown(false);
                              setShowReportModal(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Flag size={14} />
                            Report User
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => {
                              setShowDropdown(false);
                              setShowBlockModal(true);
                            }}
                            className="flex items-center gap-2 text-error"
                          >
                            <UserX size={14} />
                            Block User
                          </button>
                        </li>
                        <li>
                          <button 
                            onClick={() => {
                              setShowDropdown(false);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Delete Chat
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* X button to close out */}
              <button
                className="btn btn-sm btn-ghost btn-circle hover:bg-base-200 hover:text-primary transition-colors"
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedChatSession(null);
                }}
              >
                <X size={16} />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Flag size={18} />
              Report User
            </h3>
            
            <p className="mb-4 text-sm">
              Please provide a reason for reporting {selectedUser?.fullName}. Our team will review your report and take appropriate action.
            </p>
            
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Reason for reporting..."
              rows="4"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            ></textarea>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleReportSubmit}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-error">
              <AlertTriangle size={18} />
              Block User
            </h3>
            
            <p className="mb-4 text-sm">
              Are you sure you want to block {selectedUser?.fullName}? This will permanently delete your chat history and prevent future matching with this user.
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setShowBlockModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-sm btn-error"
                onClick={handleBlockUser}
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Chat Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <AlertTriangle size={18} />
              Delete Chat
            </h3>
            
            <p className="mb-4 text-sm">
              Are you sure you want to delete this chat with {selectedUser?.fullName}? This will remove your chat history, but you may be matched with this user again in the future.
            </p>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-sm btn-primary"
                onClick={handleDeleteChat}
              >
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
