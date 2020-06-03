const path = require("path")
let util = require("../libs/util")
let wechat_file = path.join(__dirname, "./wechat.txt")
let wechat_ticket_file = path.join(__dirname, "./wechat_ticket_file.txt")
let config = {
  wechat: {
    appID: "wxbf9b81afe79e6913",
    appSecret: "92d181ed9eeaf7bee4e0122530ca8161",
    token: "imoocwechattoken123",
    checkSignature: false,
    getAccessToken() {
      return util.readFileAsync(wechat_file, "utf8")
    },
    saveAccessToken(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_file, data)
    },
    getTicket() {
      return util.readFileAsync(wechat_ticket_file, "utf8")
    },
    saveTicket(data) {
      data = JSON.stringify(data)
      return util.writeFileAsync(wechat_ticket_file, data)
    },
  },
}

module.exports = config
