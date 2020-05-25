const mongoose = require("mongoose")
const Schema = mongoose.Schema
const voteRule = new Schema({
  voteId: {
    type: Schema.Types.ObjectId,
    ref: "Vote",
  },
  auth_open: { type: Number, default: 0 },
  bg_audio: { type: String, default: "" },
  bg_img: {
    id: mongoose.ObjectId,
    url: String,
    thumb: String,
  },
  bg_img_attachment: {
    type: String,
    default: "",
  },
  bg_img_size: {
    type: String,
    default: "",
  },
  block_address: {
    type: Number,
    default: 0,
  },
  block_ip: {
    type: Number,
    default: 0,
  },
  block_level: {
    type: Number,
    default: 0,
  },
  block_max_day: {
    type: Number,
    default: 0,
  },
  block_max_hour: {
    type: Number,
    default: 0,
  },
  block_time: {
    type: Number,
    default: 0,
  },
  captcha: {
    type: Number,
    default: 0,
  },
  comment_open: {
    type: Number,
    default: 0,
  },
  display_copyright: {
    type: Number,
    default: 1,
  },
  display_navbar_self: {
    type: Number,
    default: 0,
  },
  follow_open: {
    type: Number,
    default: 0,
  },
  gift_open: {
    type: Number,
    default: 0,
  },
  live_open: {
    type: Number,
    default: 0,
  },
  open_vote_jump: {
    type: Number,
    default: 0,
  },
  output_vote_history_excel: {
    type: Number,
    default: 0,
  },
  output_vote_item_excel: {
    type: Number,
    default: 0,
  },
  page_ad_img: {
    type: Number,
    default: 0,
  },
  page_banner_auto: {
    type: Number,
    default: 0,
  },
  page_banner_effect: {
    type: Number,
    default: 0,
  },
  page_banner_pagination: {
    type: Number,
    default: 0,
  },
  page_banner_second: {
    type: Number,
    default: 0,
  },
  page_float: {
    type: Number,
    default: 0,
  },
  private_open: {
    type: Number,
    default: 0,
  },
  rule_everyday: {
    type: Number,
    default: 0,
  },
  rule_item_times: {
    type: Number,
    default: 1,
  },
  rule_max: {
    type: Number,
    default: 0,
  },
  rule_min: {
    type: Number,
    default: 0,
  },
  rule_times: {
    type: Number,
    default: 5,
  },
  rule_type: {
    type: Number,
    default: 1,
  },
  sign_form: {
    type: Number,
    default: 0,
  },
  sign_notice_wx: {
    type: Number,
    default: 0,
  },
  sign_open: {
    type: Number,
    default: 0,
  },
  sign_upload_count_max: {
    type: Number,
    default: 0,
  },
  sign_video_open: {
    type: Number,
    default: 0,
  },
  statistics_vote: {
    type: Number,
    default: 0,
  },
  statistics_vote_item: {
    type: Number,
    default: 0,
  },
  style_color: {
    type: Number,
    default: 1,
  },
  style_tpl: {
    type: Number,
    default: 1,
  },
  text_copyright: {
    type: String,
    default: "",
  },
  text_notice: {
    type: String,
    default: "",
  },
  text_vote_btn_name: {
    type: Number,
    default: 0,
  },
  text_vote_item_alias: {
    type: Number,
    default: 0,
  },
  text_vote_unit: {
    type: Number,
    default: 0,
  },
  vote_banner_count: {
    type: Number,
    default: 0,
  },
  vote_count: {
    type: Number,
    default: 0,
  },
  vote_item_count: {
    type: Number,
    default: 0,
  },
  vote_read_count: {
    type: Number,
    default: 0,
  },
  vote_succ_img: {
    type: Number,
    default: 0,
  },
  display_index_column:{
    type:Number,
    default:2
  },
  rule_text:{
    type:String,
    default:''
  },
  rule_custom_text:{
    type:String,
    default:""
  }
})

module.exports = mongoose.model("Rule", voteRule)
