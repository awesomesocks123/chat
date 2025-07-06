import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useNavigate } from "react-router-dom";

const ExploreContent = ({ category }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getPublicRoomsByCategory, joinPublicRoom, setSelectedPublicRoom } = useChatStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        // Get rooms by category from the API
        const data = await getPublicRoomsByCategory(category);
        setRooms(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching rooms:", err);
        setError("Failed to load rooms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [category, getPublicRoomsByCategory]); // Re-fetch when category changes

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error shadow-lg">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 container mx-auto max-w-6xl">
      <h2 className="text-2xl font-bold mb-6">{category} Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room._id} className="card bg-accent-100 w-86 hover:bg-base-300 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden ">
            <figure className="relative">
              <img
                src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
                alt="Room thumbnail"
                className="h-60"
              />
              <div className="absolute inset-0 hover:bg-black/60 bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                <button 
                  className="btn btn-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  onClick={() => handleJoinRoom(room)}
                >
                  Join Room
                </button>
              </div>
            </figure>
            <div className="card-body">
              <h2 className="card-title">{room.name}</h2>
              <p className="text-sm text-base-content/60">{room.description}</p>
            </div>
            <div className="flex justify-between items-center px-4 pb-3">
              <div className="text-sm text-base-content/60 flex items-center gap-1">
                <User className="size-4" />
                <span>{room.participantCount || room.participants?.length || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

  // Handle joining a room
  const handleJoinRoom = async (room) => {
    try {
      setLoading(true);
      await joinPublicRoom(room._id);
      setSelectedPublicRoom(room);
      
      // Navigate to the chat page for this room
      navigate(`/explore/room/${room._id}`);
    } catch (error) {
      console.error("Error joining room:", error);
      setError("Failed to join room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

export default ExploreContent;
