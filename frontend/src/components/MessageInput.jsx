import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { Send, Plus } from "lucide-react";
const MAX_IMAGE_SIZE_MB = 5; // 5MB limit

const MessageInput = ({ isPublicRoom }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);
  const { 
    sendMessage, 
    selectedUser, 
    selectedChatSession,
    sendPublicRoomMessage,
    selectedPublicRoom 
  } = useChatStore();
  
  // Determine if we can send a message
  const canSend = isPublicRoom
    ? text.trim() && selectedPublicRoom && selectedPublicRoom._id
    : (text.trim() || imagePreview) && !imageError && selectedUser && selectedUser._id;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      setImageError("Invalid file type");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      const msg = `Image is too big (max ${MAX_IMAGE_SIZE_MB}MB)`;
      toast.error(msg);
      setImageError(msg);
      return;
    }
    // clear any previous error
    setImageError("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // For public rooms, only text messages are allowed
    if (isPublicRoom) {
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
    } 
    // For private chats, allow text and images
    else {
      if (!text.trim() && !imagePreview) return;
      if (!selectedChatSession || !selectedChatSession._id) {
        toast.error("No active chat session");
        return;
      }

      try {
        console.log("Sending private message to chat session:", selectedChatSession._id);
        await sendMessage({
          text: text.trim(),
          image: imagePreview
        });

        // Clear form
        setText("");
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message");
      }
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300 bg-base-100">
      {/* Only show image preview for private chats */}
      {!isPublicRoom && imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <i className="i-x size-3"></i>
            </button>
          </div>
        </div>
      )}
      {imageError && (
        <p className="text-xs text-error mb-3">{imageError}</p>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        {/* Only show image upload for private chats */}
        {!isPublicRoom && (
          <>
            <input
              type='file'
              accept='image/*'
              className='hidden'
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type='button'
              className={`btn btn-ghost btn-circle ${imagePreview ? "text-emerald-500" : ""}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus/>
            </button>
          </>
        )}

        <input
          type='text'
          className='input input-bordered flex-1 text-sm h-10'
          placeholder={isPublicRoom ? 'Type a message to the room...' : 'Type a message...'}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type='submit' disabled={!canSend} className='btn btn-primary animate-pulse h-10 min-h-0'>
          <Send />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
