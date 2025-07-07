import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { UserPlus, UserMinus, Check, X } from "lucide-react";
import toast from "react-hot-toast";

const FriendRequests = () => {
  const { 
    receivedFriendRequests, 
    sentFriendRequests, 
    getReceivedFriendRequests, 
    getSentFriendRequests,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest
  } = useChatStore();
  
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState("received");

  useEffect(() => {
    // Load friend requests when component mounts
    getReceivedFriendRequests();
    getSentFriendRequests();
  }, [getReceivedFriendRequests, getSentFriendRequests]);

  const handleAccept = async (userId) => {
    await acceptFriendRequest(userId);
  };

  const handleDecline = async (userId) => {
    await declineFriendRequest(userId);
  };

  const handleCancel = async (userId) => {
    await cancelFriendRequest(userId);
  };

  return (
    <div className="bg-base-100 rounded-lg shadow-lg p-4 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Friend Requests</h2>
      
      {/* Tabs */}
      <div className="tabs tabs-boxed mb-4">
        <a 
          className={`tab ${activeTab === "received" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received
          {receivedFriendRequests.length > 0 && (
            <span className="badge badge-sm badge-primary ml-2">
              {receivedFriendRequests.length}
            </span>
          )}
        </a>
        <a 
          className={`tab ${activeTab === "sent" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent
          {sentFriendRequests.length > 0 && (
            <span className="badge badge-sm badge-secondary ml-2">
              {sentFriendRequests.length}
            </span>
          )}
        </a>
      </div>
      
      {/* Received Requests */}
      {activeTab === "received" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Received Requests</h3>
          
          {receivedFriendRequests.length === 0 ? (
            <p className="text-base-content/70 text-center py-4">
              No pending friend requests
            </p>
          ) : (
            <div className="space-y-3">
              {receivedFriendRequests.map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img 
                          src={user.profilePic || "/default-avatar.png"} 
                          alt={user.fullName}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-base-content/70">@{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      className="btn btn-xs btn-circle btn-success"
                      onClick={() => handleAccept(user._id)}
                      title="Accept Request"
                    >
                      <Check size={14} />
                    </button>
                    <button 
                      className="btn btn-xs btn-circle btn-error"
                      onClick={() => handleDecline(user._id)}
                      title="Decline Request"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Sent Requests */}
      {activeTab === "sent" && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sent Requests</h3>
          
          {sentFriendRequests.length === 0 ? (
            <p className="text-base-content/70 text-center py-4">
              You haven't sent any friend requests
            </p>
          ) : (
            <div className="space-y-3">
              {sentFriendRequests.map((user) => (
                <div 
                  key={user._id} 
                  className="flex items-center justify-between p-3 bg-base-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <img 
                          src={user.profilePic || "/default-avatar.png"} 
                          alt={user.fullName}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-base-content/70">@{user.username}</p>
                    </div>
                  </div>
                  
                  <button 
                    className="btn btn-xs btn-circle btn-outline btn-error"
                    onClick={() => handleCancel(user._id)}
                    title="Cancel Request"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendRequests;
