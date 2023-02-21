const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: {
    type: Array,
    required: true,
  },
  is_friends: {
    type: Boolean,
  },
  // message_count: {
  //   type: Number,
  // },
},
  { timestamps: true }
)

module.exports = mongoose.model("Chat", chatSchema);