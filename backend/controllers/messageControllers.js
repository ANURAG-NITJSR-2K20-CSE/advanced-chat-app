const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Chat = require("../Models/ChatModel");
const User = require("../Models/UserModel");
const Message = require("../Models/MessageModel");

function sameId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function reactionEntryUserId(entry) {
  if (!entry || entry.user == null) return null;
  return entry.user._id != null ? entry.user._id : entry.user;
}

const sendMessage = asyncHandler(async (req, res) => {
    const {content, chatId } = req.body;
    if (!content || !chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    };

    try{
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name avatar");
        message = await message.populate("chat");
        message = await message.populate("reactions.user", "name avatar");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name avatar email"
        });
        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        });

        res.json(message);
    } catch(error){
        res.status(400);
        throw new Error(error.message);
    }
});

const allMessages = asyncHandler(async (req,res) => {
    try {
        const messages = await Message.find({chat: req.params.chatId})
            .populate("sender", "name avatar email")
            .populate("chat")
            .populate("reactions.user", "name avatar");
        res.json(messages);
    } catch (error){
        res.status(400);
        throw new Error(error.message);
    }

});

const reactToMessage = asyncHandler(async (req, res) => {
    const { emoji } = req.body;
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        res.status(400);
        throw new Error("Invalid message id");
    }

    if (!emoji || typeof emoji !== "string") {
        res.status(400);
        throw new Error("Emoji is required");
    }

    const trimmed = emoji.trim().slice(0, 16);
    if (!trimmed) {
        res.status(400);
        throw new Error("Invalid emoji");
    }

    const msg = await Message.findById(messageId).lean();
    if (!msg) {
        res.status(404);
        throw new Error("Message not found");
    }

    const chat = await Chat.findById(msg.chat).select("users").lean();
    if (!chat || !Array.isArray(chat.users)) {
        res.status(404);
        throw new Error("Chat not found");
    }

    const me = req.user._id;
    const inChat = chat.users.some((u) => sameId(u, me));
    if (!inChat) {
        res.status(403);
        throw new Error("Not allowed to react in this chat");
    }

    const raw = Array.isArray(msg.reactions) ? msg.reactions : [];
    let reactions = raw
        .map((r) => ({
            user: reactionEntryUserId(r),
            emoji: r.emoji,
        }))
        .filter((r) => r.user != null && r.emoji);

    const idx = reactions.findIndex((r) => r.user != null && sameId(r.user, me));

    if (idx >= 0 && reactions[idx].emoji === trimmed) {
        reactions.splice(idx, 1);
    } else if (idx >= 0) {
        reactions[idx] = { user: me, emoji: trimmed };
    } else {
        reactions.push({ user: me, emoji: trimmed });
    }

    const updated = await Message.findByIdAndUpdate(
        messageId,
        { $set: { reactions } },
        { new: true, runValidators: true }
    )
        .populate("sender", "name avatar email")
        .populate("chat")
        .populate("reactions.user", "name avatar");

    if (!updated) {
        res.status(404);
        throw new Error("Message not found");
    }

    res.json(updated);
});

module.exports = { sendMessage, allMessages, reactToMessage };