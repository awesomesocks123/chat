import { useState } from "react";
import { usePublicRoomStore } from "../store/usePublicRoomStore";
import toast from "react-hot-toast";
import { Send } from "lucide-react";

const PublicRoomMessageInput = () => {
  const [text, setText] = useState("");
  const { 
    sendPublicRoomMessage,
    selectedPublicRoom 
  } = usePublicRoomStore();
  
  // Determine if we can send a message
  const canSend = text.trim() && selectedPublicRoom && selectedPublicRoom._id;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    
    if (!selectedPublicRoom || !selectedPublicRoom._id) {
      toast.error("No room selected to send message to");
      return;
    }
    
    // Store the message text before clearing the input
    const messageText = text.trim();
    
    // Clear the input immediately for better UX
    setText("");
    
    try {
      // Send the message
      const result = await sendPublicRoomMessage({
        text: messageText,
        roomId: selectedPublicRoom._id,
      });
      
      if (!result) {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message to public room:", error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to send message");
      }
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="border-t border-base-300 p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input input-bordered flex-1"
        />
        <button
          type="submit"
          disabled={!canSend}
          className="btn btn-primary"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
};

export default PublicRoomMessageInput;
