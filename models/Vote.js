const mongoose = require("mongoose")
const Schema = mongoose.Schema
const schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "AdminUser" },
  title: { type: String },
  start_time: {
    type: Date,
  },
  end_time: {
    type: Date,
  },
  content: {
    type: String,
    default: "",
  },
  read_count: {
    type: Number,
    default: 0,
  },
  vote_item_count: {
    type: Number,
    default: 0,
  },
  create_time: {
    type: Date,
  },
  update_time: {
    type: Date,
    default: Date.now(),
  },
})

module.exports = mongoose.model("Vote", schema)
