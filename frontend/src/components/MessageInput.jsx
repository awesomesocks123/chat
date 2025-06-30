import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { Send, Plus } from "lucide-react";
const MAX_IMAGE_SIZE_MB = 5; // 5MB limit

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser, selectedChatSession } = useChatStore();
  const canSend = (text.trim() || imagePreview) && !imageError && selectedUser && selectedUser._id;

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
    if (!text.trim() && !imagePreview) return;
    if (!selectedUser || !selectedUser._id) {
      toast.error("No user selected to send message to");
      return;
    }

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        receiverId: selectedUser._id,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300 bg-base-100">
      {imagePreview && (
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

        <input
          type='text'
          className='input input-bordered flex-1 text-sm h-10'
          placeholder='Type a message...'
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
