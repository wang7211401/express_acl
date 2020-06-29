const mongoose = require("mongoose")
const Schema = mongoose.Schema
const schema = new Schema({
  voteId: { type: Schema.Types.ObjectId, ref: "Vote" },
  title: { type: String },
  create_time: {
    type: Date,
  },
  update_time: {
    type: Date,
    default: Date.now(),
  },
})

module.exports = mongoose.model("VoteType", schema)
