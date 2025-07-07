import PublicRoom from "../models/publicRoom.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js"

export const getAllPublicRooms = async (req, res) => {
    try {
        const rooms = await PublicRoom.find({ isPublic: true }).select("name description category participants").lean()
        const roomsWithCounts = rooms.map(room => ({ ...room, participantCount: room.participants.length }))
        return res.status(200).json(roomsWithCounts)
    } catch (error) {
        console.error("Error getting public rooms:", error)
        return res.status(500).json({ error: "Failed to get Public Rooms" })


    }
}

export const getRoomsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const rooms = await PublicRoom.find({ category }).select("name description category participants").lean()

        const roomsWithCounts = rooms.map(room => ({ ...room, participantCount: room.participants.length }))
        return res.status(200).json(roomsWithCounts)
    } catch (error) {
        console.error(`Error getting ${req.params.category} rooms:`, error)
        return res.status(500).json({ error: `Failed to get ${req.params.category} rooms` })

    }
}

export const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await PublicRoom.findById(roomId)
            .select("name description category participants")
            .lean();
            
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        
        // Add participant count for consistency
        const roomWithCount = { 
            ...room, 
            participantCount: room.participants.length 
        };
        
        return res.status(200).json(roomWithCount);
    } catch (error) {
        console.error(`Error getting room ${req.params.roomId}:`, error);
        return res.status(500).json({ error: "Failed to get room details" });
    }
}

export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params; // from the url
        const userId = req.user._id; // from auth middleware

        // Find the room
        const room = await PublicRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: `Room not found` })
        }

        // Check if user is already a participant
        const isAlreadyParticipant = room.participants.some(
            (participantId) => participantId.toString() === userId.toString()
        );

        // Only add user if they're not already in the room
        if (!isAlreadyParticipant) {
            room.participants.push(userId);
            await room.save();

            // Emit socket event
            if (req.io) {
                req.io.to(roomId).emit("userJoined", {
                    userId,
                    username: req.user.username, // Use username instead of fullName
                    roomId,
                });
            }
        }

        return res.status(200).json({
            message: "Successfully joined room",
            room,
        });
    } catch (error) {
        console.error(`Error joining room:`, error);
        return res.status(500).json({ error: `Failed to join room` });
    }
}

export const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const room = await PublicRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: `Room not found` })
        }
        room.participants = room.participants.filter((participantId) => participantId.toString() !== userId.toString());
        await room.save()

        // emit socket event that user left
        req.io.to(roomId).emit("userLeft", {
            userId,
            username: req.user.fullName,
            roomId
        });


        return res.status(200).json({
            message: "Sucessfully left room",
            room,
        })

    } catch (error) {
        console.error(`Error leaving room:`, error)
        return res.status(500).json({ error: `Faild to leave room` })

    }
}

export const sendMessageToRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const { text } = req.body;

        console.log(`Sending message to room ${roomId} from user ${userId}: ${text}`);

        if (!text || typeof text !== 'string') {
            console.error('Invalid message text:', text);
            return res.status(400).json({ error: "Message text is required" });
        }

        // Find the room
        const room = await PublicRoom.findById(roomId);
        if (!room) {
            console.error(`Room not found: ${roomId}`);
            return res.status(404).json({ error: "Room not found" });
        }

        console.log(`Found room: ${room.name}, checking if user is participant`);

        // Check if user is a participant
        const isParticipant = room.participants.some(
            (participantId) => participantId.toString() === userId.toString()
        );

        if (!isParticipant) {
            console.error(`User ${userId} is not a participant in room ${roomId}`);
            return res.status(403).json({ error: "You are not a participant in this room" });
        }

        console.log(`User is participant, creating message`);

        // Create a new message document
        const newMessage = new Message({
            sender: userId,
            text: text.trim(),
            roomId, // Store the roomId in the message
            createdAt: new Date()
        });

        try {
            // Save the message
            await newMessage.save();
            console.log(`Message saved with ID: ${newMessage._id}`);
            
            // Update the room's lastMessage reference
            room.lastMessage = {
                text: text.trim(),
                sender: userId,
                createdAt: new Date()
            };
            await room.save();
            console.log(`Room lastMessage updated`);

            // Populate the sender details for the response
            const populatedMessage = await Message.findById(newMessage._id)
                .populate("sender", "fullName username profilePic")
                .lean();

            console.log(`Emitting newRoomMessage event to room ${roomId}`);
            // Emit the message to all clients in the room
            req.io.to(roomId).emit("newRoomMessage", populatedMessage);

            return res.status(201).json(populatedMessage);
        } catch (saveError) {
            console.error("Error saving message or updating room:", saveError);
            return res.status(500).json({ error: "Failed to save message", details: saveError.message });
        }
    } catch (error) {
        console.error("Error in sendMessageToRoom:", error);
        return res.status(500).json({ error: "Failed to send message", details: error.message });
    }
}

export const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        console.log(`Getting messages for room ${roomId} for user ${userId}`);

        // Find the room
        const room = await PublicRoom.findById(roomId);
        if (!room) {
            console.log(`Room ${roomId} not found`);
            return res.status(404).json({ error: `Room not found` });
        }

        // Check if user is a participant
        const isParticipant = room.participants.some(
            (participantId) => participantId.toString() === userId.toString()
        );

        if (!isParticipant) {
            console.log(`User ${userId} is not a participant in room ${roomId}`);
            return res.status(403).json({ error: `You are not a participant in this room` });
        }

        // Get messages for this room from the Message model
        const messages = await Message.find({ roomId })
            .populate("sender", "fullName username profilePic")
            .sort({ createdAt: 1 })
            .lean();

        console.log(`Found ${messages.length} messages for room ${roomId}`);
        return res.status(200).json(messages);
    } catch (error) {
        console.error(`Error getting room messages:`, error);
        return res.status(500).json({ error: `Failed to get room messages` });
    }
}

export const getRoomParticipants = async (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Find the room and populate the participants field
        const room = await PublicRoom.findById(roomId).populate("participants", "fullName username profilePic email");
        
        if (!room) {
            return res.status(404).json({ error: `Room not found` });
        }
        
        return res.status(200).json(room.participants);
        
    } catch (error) {
        console.error("Error getting room participants:", error);
        return res.status(500).json({ error: "Failed to get room participants" });
    }
}