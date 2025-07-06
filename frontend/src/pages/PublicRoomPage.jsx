import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, Send } from 'lucide-react';

const PublicRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const { 
    selectedPublicRoom, 
    setSelectedPublicRoom, 
    publicRoomMessages, 
    getPublicRoomMessages, 
    sendPublicRoomMessage,
    joinPublicRoom,
    leavePublicRoom
  } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const loadRoom = async () => {
      if (roomId) {
        // Join the room if not already joined
        await joinPublicRoom(roomId);
        
        // Get messages for the room
        await getPublicRoomMessages(roomId);
      }
    };

    loadRoom();

    // Cleanup: leave room when component unmounts
    return () => {
      if (roomId) {
        leavePublicRoom(roomId);
      }
    };
  }, [roomId, joinPublicRoom, getPublicRoomMessages, leavePublicRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendPublicRoomMessage(roomId, message);
    setMessage('');
  };

  const handleBack = () => {
    navigate('/explore');
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
      <div className="bg-base-200 p-4 flex items-center gap-3">
        <button onClick={handleBack} className="btn btn-ghost btn-circle">
          <ArrowLeft />
        </button>
        <div>
          <h2 className="text-xl font-bold">{selectedPublicRoom.name}</h2>
          <p className="text-sm text-base-content/60">
            {selectedPublicRoom.participantCount || selectedPublicRoom.participants?.length || 0} participants
          </p>
        </div>
      </div>

      {/* Messages */}
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
