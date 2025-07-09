import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { X, UserPlus, Flag, Ban, Check, Clock } from "lucide-react";
import toast from "react-hot-toast";

const PublicRoomParticipantsPanel = ({ participants, onClose }) => {
  const { onlineUsers, authUser } = useAuthStore();
  const { 
    sendFriendRequest, 
    blockUser, 
    reportUser, 
    friends,
    receivedFriendRequests,
    sentFriendRequests,
    getReceivedFriendRequests,
    getSentFriendRequests
  } = useChatStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // Split participants into online and offline
  const onlineParticipants = participants.filter(p => 
    onlineUsers.includes(p._id) && p._id !== authUser._id
  );
  
  const offlineParticipants = participants.filter(p => 
    !onlineUsers.includes(p._id) && p._id !== authUser._id
  );
  
  // Current user should always be shown first and online
  const currentUser = participants.find(p => p._id === authUser._id);
  
  useEffect(() => {
    // Load friend requests when component mounts
    getReceivedFriendRequests();
    getSentFriendRequests();
  }, [getReceivedFriendRequests, getSentFriendRequests]);
  
  // Helper function to check if a user is a friend
  const isFriend = (userId) => {
    return friends.some(friend => friend._id === userId);
  };
  
  // Helper function to check if we've sent a friend request to this user
  const hasSentRequestTo = (userId) => {
    return sentFriendRequests.some(request => request._id === userId);
  };
  
  // Helper function to check if we've received a friend request from this user
  const hasReceivedRequestFrom = (userId) => {
    return receivedFriendRequests.some(request => request._id === userId);
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      await sendFriendRequest(userId);
    } catch (error) {
      // Error handling is done in the store function
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await blockUser(userId);
      toast.success("User blocked");
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const openReportModal = (user) => {
    setSelectedUser(user);
    setShowReportModal(true);
  };

  const handleReportUser = async () => {
    if (!reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    try {
      await reportUser(selectedUser._id, reportReason);
      toast.success("User reported");
      setShowReportModal(false);
      setReportReason("");
    } catch (error) {
      toast.error("Failed to report user");
    }
  };

  const ParticipantItem = ({ participant, isCurrentUser }) => (
    <div className="flex items-center justify-between p-2 hover:bg-base-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div>
          <p className="font-medium">
            {isCurrentUser || isFriend(participant._id) 
              ? participant.fullName 
              : participant.username || participant.fullName} 
            {isCurrentUser && "(You)"}
          </p>
          <p className="text-xs text-base-content/70">
            {participant.email || "No email"}
          </p>
        </div>
      </div>
      
      {!isCurrentUser && (
        <div className="flex gap-2">
          {isFriend(participant._id) ? (
            <span className="badge badge-success gap-1">
              <Check size={12} /> Friend
            </span>
          ) : hasReceivedRequestFrom(participant._id) ? (
            <span className="badge badge-warning gap-1">
              <Clock size={12} /> Request Received
            </span>
          ) : hasSentRequestTo(participant._id) ? (
            <span className="badge badge-info gap-1">
              <Clock size={12} /> Request Sent
            </span>
          ) : (
            <button 
              className="btn btn-sm btn-outline btn-primary" 
              onClick={() => handleSendFriendRequest(participant._id)}
              title="Send Friend Request"
            >
              <UserPlus size={16} />
            </button>
          )}
          <button 
            className="btn btn-sm btn-outline btn-warning" 
            onClick={() => openReportModal(participant)}
            title="Report User"
          >
            <Flag size={16} />
          </button>
          <button 
            className="btn btn-sm btn-outline btn-error" 
            onClick={() => handleBlockUser(participant._id)}
            title="Block User"
          >
            <Ban size={16} />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-base-100 flex flex-col h-full">
      <div className="p-4 border-b border-base-300 flex justify-between items-center">
        <h3 className="font-bold text-lg">Participants ({participants.length})</h3>
        <button className="btn btn-ghost btn-sm btn-circle" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2">
        {/* Current user */}
        {currentUser && (
          <div className="mb-4">
            <ParticipantItem participant={currentUser} isCurrentUser={true} />
          </div>
        )}
        
        {/* Online users */}
        {onlineParticipants.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-success px-2 mb-2">
              Online ({onlineParticipants.length})
            </h4>
            <div className="space-y-1">
              {onlineParticipants.map(participant => (
                <ParticipantItem 
                  key={participant._id} 
                  participant={participant} 
                  isCurrentUser={false}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Offline users */}
        {offlineParticipants.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-base-content/70 px-2 mb-2">
              Offline ({offlineParticipants.length})
            </h4>
            <div className="space-y-1">
              {offlineParticipants.map(participant => (
                <ParticipantItem 
                  key={participant._id} 
                  participant={participant} 
                  isCurrentUser={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Report modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h3 className="font-bold text-lg mb-4">
              Report {selectedUser?.fullName}
            </h3>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Reason for reporting..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error" 
                onClick={handleReportUser}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicRoomParticipantsPanel;
