const mongoose = require("mongoose");

const MessageModel = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: { type: String, trim: true },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String, trim: true, maxlength: 16 },
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Message = mongoose.model("Message", MessageModel);
module.exports = Message;