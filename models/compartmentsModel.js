const mongoose = require("mongoose");

const compartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: Boolean,
    required: true,
  },
  car_id: {
    type: String,
    required: true,
  },
  owner_id: {
    type: String,
  },
},
  { timestamps: true }
)

module.exports = mongoose.model("Compartment", compartmentSchema);