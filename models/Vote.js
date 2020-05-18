const mongoose = require("mongoose")

const schema = new mongoose.Schema({
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
})

module.exports = mongoose.model("Vote", schema)
