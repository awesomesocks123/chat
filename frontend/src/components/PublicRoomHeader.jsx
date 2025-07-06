import { Menu, Users } from "lucide-react";
import { usePublicRoomStore } from "../store/usePublicRoomStore";
import { useState } from "react";
import PublicRoomParticipantsPanel from "./PublicRoomParticipantsPanel";

const PublicRoomHeader = ({ toggleSidebar, room, participantCount, showParticipants, setShowParticipants }) => {
  const { publicRoomParticipants, leavePublicRoom } = usePublicRoomStore();

  const handleLeaveRoom = async () => {
    if (room && room._id) {
      await leavePublicRoom(room._id);
    }
  };

  return (
    <div className="border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center">
          <button
            className="btn btn-square btn-ghost md:hidden mr-2"
            onClick={toggleSidebar}
          >
            <Menu size={20} />
          </button>
          <div>
            <h2 className="font-bold text-lg">{room?.name || "Public Room"}</h2>
            <p className="text-sm text-base-content/70">
              {room?.category || "General"} • {participantCount} participants
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users size={18} />
            <span className="hidden md:inline ml-1">Participants</span>
          </button>
          <button
            className="btn btn-ghost btn-sm text-error"
            onClick={handleLeaveRoom}
          >
            Leave Room
          </button>
        </div>
      </div>

      {/* Participants Panel is now in the PublicRoomContainer */}
    </div>
  );
};

export default PublicRoomHeader;
