import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, Send, Users, UserPlus, Ban, Flag, X, ChevronDown, ChevronUp } from 'lucide-react';

const PublicRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [participants, setParticipants] = useState([]);
  const { 
    selectedPublicRoom, 
    setSelectedPublicRoom, 
    publicRoomMessages, 
    getPublicRoomMessages, 
    sendPublicRoomMessage,
    joinPublicRoom,
    leavePublicRoom,
    getPublicRoomParticipants
  } = useChatStore();
  const { user, onlineUsers } = useAuthStore();

  useEffect(() => {
    const loadRoom = async () => {
      if (roomId) {
        // Join the room if not already joined
        await joinPublicRoom(roomId);
        
        // Get messages for the room
        await getPublicRoomMessages(roomId);
        
        // Get participants for the room
        const roomParticipants = await getPublicRoomParticipants(roomId);
        setParticipants(roomParticipants || []);
      }
    };

    loadRoom();

    // Refresh participants list every 30 seconds
    const participantsInterval = setInterval(async () => {
      if (roomId) {
        const roomParticipants = await getPublicRoomParticipants(roomId);
        setParticipants(roomParticipants || []);
      }
    }, 30000);

    // Cleanup: leave room when component unmounts
    return () => {
      if (roomId) {
        leavePublicRoom(roomId);
      }
      clearInterval(participantsInterval);
    };
  }, [roomId, joinPublicRoom, getPublicRoomMessages, getPublicRoomParticipants, leavePublicRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendPublicRoomMessage(roomId, message);
    setMessage('');
  };

  const handleBack = () => {
    navigate('/explore');
  };
  
  const handleAddUser = (userId) => {
    // Implement add user functionality
    console.log('Add user:', userId);
    // You can implement this functionality based on your requirements
  };
  
  const handleBlockUser = (userId) => {
    // Implement block user functionality
    console.log('Block user:', userId);
    // You can implement this functionality based on your requirements
  };
  
  const handleReportUser = (userId) => {
    // Implement report user functionality
    console.log('Report user:', userId);
    // You can implement this functionality based on your requirements
  };
  
  const toggleParticipants = () => {
    setShowParticipants(!showParticipants);
  };

  if (!selectedPublicRoom) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-base-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="btn btn-ghost btn-circle">
            <ArrowLeft />
          </button>
          <div>
            <h2 className="text-xl font-bold">{selectedPublicRoom.name}</h2>
            <p className="text-sm text-base-content/60">
              {participants.length || selectedPublicRoom.participantCount || selectedPublicRoom.participants?.length || 0} participants
            </p>
          </div>
        </div>
        <button 
          onClick={toggleParticipants} 
          className="btn btn-ghost btn-circle tooltip" 
          data-tip="View Participants"
        >
          <Users />
        </button>
      </div>

      {/* Main content area with messages and participants panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Participants panel - conditionally shown */}
        {showParticipants && (
          <div className="w-64 bg-base-200 overflow-y-auto flex flex-col border-r border-base-300">
            <div className="p-3 font-bold border-b border-base-300 flex justify-between items-center">
              <span>Participants ({participants.length})</span>
              <button onClick={toggleParticipants} className="btn btn-ghost btn-xs btn-circle">
                <X size={16} />
              </button>
            </div>
            
            {/* Online users */}
            <div className="p-2">
              <div className="text-xs font-semibold text-success flex items-center gap-1 mb-2">
                <span className="w-2 h-2 bg-success rounded-full"></span>
                <span>Online</span>
              </div>
              {participants
                .filter(p => onlineUsers.includes(p._id))
                .map(participant => (
                  <div key={participant._id} className="flex items-center p-2 hover:bg-base-300 rounded-lg group relative">
                    <div className="avatar mr-2">
                      <div className="w-8 rounded-full">
                        <img src={participant.profilePic || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={participant.fullName} />
                      </div>
                    </div>
                    <div className="flex-1 truncate">{participant.fullName}</div>
                    <div className="absolute right-2 bg-base-100 shadow-lg rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button 
                        onClick={() => handleAddUser(participant._id)} 
                        className="btn btn-ghost btn-xs btn-circle tooltip" 
                        data-tip="Add Friend"
                      >
                        <UserPlus size={14} />
                      </button>
                      <button 
                        onClick={() => handleBlockUser(participant._id)} 
                        className="btn btn-ghost btn-xs btn-circle tooltip" 
                        data-tip="Block"
                      >
                        <Ban size={14} />
                      </button>
                      <button 
                        onClick={() => handleReportUser(participant._id)} 
                        className="btn btn-ghost btn-xs btn-circle tooltip" 
                        data-tip="Report"
                      >
                        <Flag size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
            
            {/* Offline users */}
            <div className="p-2">
              <div className="text-xs font-semibold text-base-content/60 flex items-center gap-1 mb-2">
                <span className="w-2 h-2 bg-base-content/60 rounded-full"></span>
                <span>Offline</span>
              </div>
              {participants
                .filter(p => !onlineUsers.includes(p._id))
                .map(participant => (
                  <div key={participant._id} className="flex items-center p-2 hover:bg-base-300 rounded-lg group relative">
                    <div className="avatar mr-2">
                      <div className="w-8 rounded-full opacity-60">
                        <img src={participant.profilePic || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} alt={participant.fullName} />
                      </div>
                    </div>
                    <div className="flex-1 truncate text-base-content/60">{participant.fullName}</div>
                    <div className="absolute right-2 bg-base-100 shadow-lg rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button 
                        onClick={() => handleAddUser(participant._id)} 
                        className="btn btn-ghost btn-xs btn-circle tooltip" 
                        data-tip="Add Friend"
                      >
                        <UserPlus size={14} />
                      </button>
                      <button 
                        onClick={() => handleBlockUser(participant._id)} 
                        className="btn btn-ghost btn-xs btn-circle tooltip" 
                        data-tip="Block"
                      >
                        <Ban size={14} />
                      </button>
                      <button 
                        onClick={() => handleReportUser(participant._id)} 
                        className="btn btn-ghost btn-xs btn-circle tooltip" 
                        data-tip="Report"
                      >
                        <Flag size={14} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {publicRoomMessages.map((msg, index) => (
            <div 
              key={index}
              className={`chat ${msg.sender?._id === user?._id ? 'chat-end' : 'chat-start'}`}
            >
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img 
                    src={msg.sender?.profilePic || "https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"} 
                    alt={msg.sender?.fullName || "User"} 
                  />
                </div>
              </div>
              <div className="chat-header">
                {msg.sender?.fullName || "Anonymous"}
              </div>
              <div className={`chat-bubble ${msg.sender?._id === user?._id ? 'chat-bubble-primary' : ''}`}>
                {msg.text}
              </div>
              <div className="chat-footer opacity-50 text-xs">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-base-200 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="input input-bordered flex-1"
        />
        <button type="submit" className="btn btn-primary">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default PublicRoomPage;
