const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chat_id: {
        type: String,
    },
    compartment_id: {
        type: String,
    },
    parent_message_id: {
        type: String,
    },
    author: {
        type: Object,
        required: true,
    },
    content: {
        type: String,
    },
    mention_everyone: {
        type: Boolean,
    },
    mentions: {
        type: Array,
    },
    attachments: {
        type: Array,
    },
    reactions: {
        type: Array,
    },
    stickers: {
        type: Array,
    },
    },
    { timestamps: true }
    )

module.exports = mongoose.model("Message", messageSchema);