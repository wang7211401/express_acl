const mongoose = require("mongoose")
const Schema = mongoose.Schema
const voteItem = new Schema({
  voteId: { type: Schema.Types.ObjectId, ref: "Vote" },
  cover_bom: {
    type: String,
  },
  cover_url: {
    type: String,
  },
  describe: {
    type: String,
  },
  gift_count: {
    type: Number,
  },
  gift_vote_count: {
    type: Number,
  },
  index: {
    type: Number,
  },
  is_examine: {
    type: Number,
  },
  is_lock: {
    type: Number,
  },
  is_video: {
    type: Number,
  },
  link: {
    type: String,
  },
  progress: {
    diff: { type: String },
    is_cache: { type: Number },
    progress: { type: Number },
    rank: { type: String },
  },
  read_count: { type: Number },
  share_sns_count: { type: Number },
  share_wx_count: { type: Number },
  title: { type: String },
  slogan: { type: String },
  vote_count: { type: Number },
  vote_item_type_id: { type: Number },
  content: {
    type: String,
  },
})

module.exports = mongoose.model("Item", voteItem)
