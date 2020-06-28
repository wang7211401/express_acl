const mongoose = require("mongoose")

const schema = new mongoose.Schema({
  username: { type: String },
  password: {
    type: String,
    select: false,
    set(val) {
      return require("md5")(val)
    },
  },
  subscribe: {
    type: Number,
  },
  openid: {
    type: String,
  },
  nickname: {
    type: String,
  },
  sex: {
    type: Number,
  },
  city: {
    type: String,
  },
  province: {
    type: String,
  },
  country: {
    type: String,
  },
  headimgurl: {
    type: String,
  },
  subscribe_time: {
    type: Number,
  },
  subscribe_scene: {
    type: String,
  },
  qr_scene: {
    type: Number,
  },
  qr_scene_str: {
    type: String,
  },
})

module.exports = mongoose.model("AdminUser", schema)
