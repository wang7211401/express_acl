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
    default: 0,
  },
  gift_vote_count: {
    type: Number,
    default: 0,
  },
  index: {
    type: Number,
  },
  is_examine: {
    type: Number,
    default: 1,
  },
  is_lock: {
    type: Number,
    default: 0,
  },
  is_video: {
    type: Number,
    default: 0,
  },
  link: {
    type: String,
  },
  progress: {
    diff: { type: Number, default: 1 },
    is_cache: { type: Number },
    progress: { type: Number, default: 0 },
    rank: { type: String, default: "-" },
  },
  read_count: { type: Number, default: 0 },
  share_sns_count: { type: Number, default: 0 },
  share_wx_count: { type: Number, default: 0 },
  title: { type: String, default: "" },
  slogan: { type: String },
  vote_count: { type: Number, default: 0 },
  vote_item_type_id: {  type: Schema.Types.ObjectId, ref: "VoteType" },
  content: {
    type: String,
    default: "",
  },
  create_time: {
    type: Date,
  },
})

module.exports = mongoose.model("Item", voteItem)
