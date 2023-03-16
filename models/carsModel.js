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

// const carSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   compartments: {
//     type: Array,
//     comp_name: {
//       type: String,
//       default: ['general']
//     },
//     comp_type: {
//       type: String,
//     },
//     posts: {
//       type: Array,
//       post_username: {
//         type: String,
//       },
//       post_image: {
//         type: String,
//       },
//       post_desc: {
//         type: String,
//       },
//       post_like: {
//         type: Array,
//       },
//       post_reply: {
//         type: Object,
//         reply_username: {
//           type: String,
//         },
//         reply_image: {
//           type: String,
//         },
//         reply_desc: {
//           type: String,
//         },
//         reply_like: {
//           type: Array
//         }
//       }
//     }
//   },
//   category: {
//     type: String,
//   },
//   members: [{
//     member_name: {
//       type: String
//     }
//   }]
// },
//   { timestamps: true }
// )

module.exports = mongoose.model("Car", carSchema);