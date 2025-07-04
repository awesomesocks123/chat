import publicRoom from "../models/publicRoom.model.js";
import Message from "../models/message.model.js"

export const getAllPublicRooms = async (req, res) => {
    try {
        const rooms = await publicRoom.find({ isPublic: true }).select("name description category participants").lean()
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

export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params; // from the url
        const userId = req.user._id; // from auth middleware

        // Find the room
        const room = await PublicRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: `Failed to get ${req.params}` })
        }

        //Add user to room
        room.participants.push(userId);
        await room.save()

        //emit socket event
        req.io.to(roomId).emit("userJoined", {
            userId,
            username: req.user.fullName,
            roomId,
        })
        return res.status(200).json({
            message: "Success",
            room,
        })


    } catch (error) {
        console.error(`Error joining room:`, error)
        return res.status(500).json({ error: `Faild to join room` })

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

export const sendMessagesToRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const { text } = req.body;

        const room = await PublicRoom.findById(roomId)

        const newMessage = new Message({
            senderId: userId,
            text,
            createdAt: new Date()
        })

        room.messages.push(newMessage);
        room.lastMessage = newMessage;
        await room.save();

        const populateRoom = await PublicRoom.findbyId(roomId)
            .populate("messages.sender", "fullName profilePic")
            .select("messages");

        const sentMessage = populateRoom.messages[populateRoom.messages.length - 1];

        req.io.to(roomId).emit("newRoomMessage", { message: sentMessage, roomId })

        return res.status(201).json(sentMessage)

    } catch (error) {
        console.error("Error in sendMessage", error);
        return res.status(500).json({ error: "Internal server error" })

    }
}

export const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await PublicRoom.findById(roomId).populate("messages.sender", "fullName profilePic");

        if (!room) {
            return res.status(404).json({ error: `Room not found` });
        }

        return res.status(200).json(room.messages)

    } catch (error) {

        console.error("Error in getRoomMessages", error);
        return res.status(500).json({ error: "Internal server error" })

    }
}