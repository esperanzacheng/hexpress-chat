const mongoose = require("mongoose");

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  members: {
    type: Array
  },
  members_count: {
    type: Number,
  },
  owner_id: {
    type: String,
  },
},
  { timestamps: true }
)

module.exports = mongoose.model("Car", carSchema);