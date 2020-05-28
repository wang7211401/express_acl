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
  display_copyright: {
    type: Number,
    default: 1,
  },
  gift_open: {
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
    type: String,
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
    type: String,
    default: "投票",
  },
  text_vote_item_alias: {
    type: String,
    default: "选手",
  },
  text_vote_unit: {
    type: String,
    default: "票",
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
    type: String,
  },
  vote_img_link: {
    type: String,
  },
  vote_jump_link: {
    type: String,
  },
  vote_jump_msg: {
    type: String,
  },
  vote_jump_second: {
    type: Number,
    default: 3,
  },
  display_index_column: {
    type: Number,
    default: 2,
  },
  page_ad_close: {
    type: Number,
    default: 1,
  },
  page_ad_second: {
    type: String,
    default: 5,
  },
  page_ad_show_times: {
    type: Number,
    default: 1,
  },
  page_ad_show_minute: {
    type: String,
    default: 30,
  },
  rule_text: {
    type: String,
    default: "",
  },
  rule_custom_text: {
    type: String,
    default: "",
  },
  page_vote_item_type_column: {
    type: Number,
    default: 2,
  },
  page_vote_item_load_type: {
    type: Number,
    default: 1,
  },
  display_vote_item_count: {
    type: Number,
    default: 0,
  },
  display_vote_count: {
    type: Number,
    default: 0,
  },
  display_read_count: {
    type: Number,
    default: 0,
  },
  display_index_banner: {
    type: Number,
    default: 1,
  },
  display_index_title: {
    type: Number,
    default: 1,
  },
  display_index_data: {
    type: Number,
    default: 1,
  },
  display_index_rule: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_type: {
    type: Number,
    default: 1,
  },
  display_index_search: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_number: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_cover: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_name: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_slogan: {
    type: Number,
    default: 1,
  },
  display_index_vote_count: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_button: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_detail: {
    type: Number,
    default: 1,
  },
  display_index_show_type: {
    type: Number,
    default: 1,
  },
  display_index_sort: {
    type: Number,
    default: 1,
  },
  display_index_vote_item_type_all_button: {
    type: Number,
    default: 1,
  },
  display_content_banner: {
    type: Number,
    default: 1,
  },
  display_content_title: {
    type: Number,
    default: 1,
  },
  display_content_data: {
    type: Number,
    default: 1,
  },
  display_content_rule: {
    type: Number,
    default: 1,
  },
  display_detail_banner: {
    type: Number,
    default: 1,
  },
  display_detail_vote_item_data: {
    type: Number,
    default: 1,
  },
  display_detail_vote_item_number: {
    type: Number,
    default: 1,
  },
  display_detail_vote_item_name: {
    type: Number,
    default: 1,
  },
  display_detail_vote_item_slogan: {
    type: Number,
    default: 1,
  },
  display_detail_vote_item_cover: {
    type: Number,
    default: 1,
  },
  display_detail_poster_button: {
    type: Number,
    default: 1,
  },
  display_detail_back_button: {
    type: Number,
    default: 1,
  },
  display_detail_img_swp: {
    type: Number,
    default: 0,
  },
  display_sign_banner: {
    type: Number,
    default: 1,
  },
  display_sign_title: {
    type: Number,
    default: 1,
  },
  display_sign_data: {
    type: Number,
    default: 1,
  },
  display_sign_rule: {
    type: Number,
    default: 1,
  },
  display_rank_banner: {
    type: Number,
    default: 1,
  },
  display_rank_title: {
    type: Number,
    default: 1,
  },
  display_rank_data: {
    type: Number,
    default: 1,
  },
  display_rank_vote_item_type: {
    type: Number,
    default: 1,
  },
  display_rank_rule: {
    type: Number,
    default: 1,
  },
  display_rank_vote_item_cover: {
    type: Number,
    default: 1,
  },
  display_rank_show: {
    type: Number,
    default: 1,
  },
  display_rank_vote_item_type_all_button: {
    type: Number,
    default: 1,
  },
  display_navbar_home: {
    type: Number,
    default: 1,
  },
  display_navbar_content: {
    type: Number,
    default: 1,
  },
  display_navbar_sign: {
    type: Number,
    default: 1,
  },
  display_navbar_search: {
    type: Number,
    default: 1,
  },
  display_navbar_rank: {
    type: Number,
    default: 1,
  },
  display_navbar_self: {
    type: Number,
    default: 0,
  },
  display_navbar_self_name: {
    type: String,
  },
  display_navbar_self_link: {
    type: String,
  },
  share_open: {
    type: Number,
    default: 1,
  },
  share_title: {
    type: String,
  },
  share_desc: {
    type: String,
  },
  share_vote_item_title: {
    type: String,
  },
  share_vote_item_desc: {
    type: String,
  },
  share_img: {
    type: String,
  },
  captcha: {
    type: Number,
    default: 0,
  },
  block_max_hour: {
    type: Number,
    default: 0,
  },
  block_max_day: {
    type: Number,
    default: 0,
  },
  block_level: {
    type: Number,
    default: 2,
  },
  block_time: {
    type: Number,
    default: 0,
  },
  block_time_start: {
    type: String,
  },
  block_time_end: {
    type: String,
  },
  block_address: {
    type: String,
  },
  block_ip: {
    type: String,
  },
  follow_open: {
    type: Number,
    default: 0,
  },
  follow_keyword: {
    type: String,
  },
  comment_open: {
    type: Number,
    default: 0,
  },
  private_open: {
    type: Number,
    default: 0,
  },
  live_open: {
    type: Number,
    default: 0,
  },
  display_live_column: {
    type: Number,
    default: 6,
  },
  sign_open: {
    type: Number,
    default: 0,
  },
  sign_multiple: {
    type: Number,
    default: 0,
  },
  sign_video_open: {
    type: Number,
    default: 0,
  },
  sign_notice_wx: {
    type: Number,
    default: 0,
  },
  sign_upload_count_min: {
    type: Number,
    default: 0,
  },
  sign_upload_count_max: {
    type: Number,
    default: 1,
  },
  sign_upload_name: {
    type: String,
    default: "图片",
  },
  vote_item_type_name: {
    type: String,
    default: "分组",
  },
  sign_form: {
    title: {
      config: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "标题",
      },
      not_del: {
        type: Number,
        default: 1,
      },
      not_edit_validate: {
        type: Number,
        default: 1,
      },
      show: {
        type: Number,
        default: 2,
      },
      validate: {
        type: Number,
        default: 0,
      },
    },
    content: {
      config: {
        type: String,
        default: "",
      },
      name: {
        type: String,
        default: "描述",
      },
      not_del: {
        type: Number,
        default: 1,
      },
      not_edit_validate: {
        type: Number,
        default: 1,
      },
      show: {
        type: Number,
        default: 2,
      },
      validate: {
        type: Number,
        default: 0,
      },
    },
  },
})

module.exports = mongoose.model("Rule", voteRule)
