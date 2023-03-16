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
  // message_count: {
  //   type: Number,
  // },
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

module.exports = mongoose.model("Compartment", compartmentSchema);