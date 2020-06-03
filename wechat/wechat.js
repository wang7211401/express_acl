const Promise = require("bluebird")
const _ = require("lodash")
const fs = require("fs")
const request = Promise.promisify(require("request"))
const util = require("./util")
let mpPrefix = "https://mp.weixin.qq.com/cgi-bin/"
let semanticUrl = "https://api.weixin.qq.com/semantic/search?"
let prefix = "https://api.weixin.qq.com/cgi-bin/"
let api = {
  semanticUrl,
  accessToken: prefix + "token?grant_type=client_credential",
  temporary: {
    upload: prefix + "media/upload?",
    fetch: prefix + "media/get?",
  },
  permanent: {
    upload: prefix + "material/add_material?",
    fetch: prefix + "material/get_material?",
    uploadNews: prefix + "material/add_news?",
    uploadNewsPic: prefix + "media/uploadimg?",
    del: prefix + "material/del_material?",
    update: prefix + "material/update_news?",
    count: prefix + "material/get_materialcount?",
    batch: prefix + "material/batchget_material?",
  },
  group: {
    create: prefix + "groups/create?",
    fetch: prefix + "groups/get?",
    check: prefix + "groups/getid?",
    update: prefix + "groups/update?",
    move: prefix + "groups/members/update?",
    batchupdate: prefix + "groups/members/batchupdate?",
    del: prefix + "groups/delete?",
  },
  user: {
    remark: prefix + "user/info/updateremark?",
    fetch: prefix + "user/info?",
    batchFetch: prefix + "user/info/batchget?",
    list: prefix + "user/get?",
  },
  mass: {
    group: prefix + "message/mass/sendall?",
    openId: prefix + "message/mass/send?",
    del: prefix + "message/mass/delete?",
    preview: prefix + "message/mass/preview?",
    check: prefix + "message/mass/get?",
  },
  menu: {
    create: prefix + "menu/create?",
    get: prefix + "menu/get?",
    del: prefix + "menu/delete?",
    current: prefix + "get_current_selfmenu_info?",
  },
  qrcode: {
    create: prefix + "qrcode/create?",
    show: mpPrefix + "showqrcode?",
  },
  shortUrl: {
    create: prefix + "shorturl?",
  },
  ticket: {
    get: prefix + "ticket/getticket?",
  },
}

function Wechat(opts) {
  this.appID = opts.appID
  this.appSecret = opts.appSecret
  this.getAccessToken = opts.getAccessToken
  this.saveAccessToken = opts.saveAccessToken
  this.getTicket = opts.getTicket
  this.saveTicket = opts.saveTicket
  this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function () {
  return this.getAccessToken()
    .then((data) => {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return this.updateAccessToken()
      }

      if (this.isValidAccessToken(data)) {
        return Promise.resolve(data)
      } else {
        return this.updateAccessToken()
      }
    })
    .then((res) => {
      this.access_token = res.access_token
      this.expires_in = res.expires_in
      this.saveAccessToken(res)
      return Promise.resolve(res)
    })
}

Wechat.prototype.isValidAccessToken = function (data) {
  if (!data || !data.access_token || !data.expires_in) {
    return false
  }

  let access_token = data.access_token
  let expires_in = data.expires_in
  let now = new Date().getTime()

  if (now < expires_in) {
    return true
  } else {
    return false
  }
}

Wechat.prototype.updateAccessToken = function (data) {
  let appID = this.appID
  let appSecret = this.appSecret
  let url = `${api.accessToken}&appid=${appID}&secret=${appSecret}`

  return new Promise((resolve, reject) => {
    request({ url: url, json: true }).then((response) => {
      let data = response.body
      let now = new Date().getTime()
      let expires_in = now + (data.expires_in - 20) * 1000
      data.expires_in = expires_in
      resolve(data)
    })
  })
}

Wechat.prototype.uploadMaterial = function (type, material, permanent) {
  let form = {}
  let uploadUrl = api.temporary.upload

  if (permanent) {
    uploadUrl = api.permanent.upload
    _.extend(form, permanent)
  }
  if (type === "pic") {
    uploadUrl = api.permanent.uploadNewsPic
  }

  if (type === "news") {
    uploadUrl = api.permanent.uploadNews
    form = material
  } else {
    form.media = fs.createReadStream(material)
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = `${uploadUrl}access_token=${data.access_token}`

      if (!permanent) {
        url += "&type=" + type
      } else {
        form.access_token = data.access_token
      }

      let options = {
        method: "POST",
        url: url,
        json: true,
      }
      if (type === "news") {
        options.body = form
      } else {
        options.formData = form
      }
      console.log(options)
      request(options)
        .then((response) => {
          let data = response.body
          if (data) {
            resolve(data)
          } else {
            throw new Error("upload material fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
  let fetchUrl = api.temporary.fetch

  if (permanent) {
    fetchUrl = api.permanent.fetch
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = fetchUrl + "access_token=" + data.access_token
      let form = {}
      let options = { method: "POST", url: url, json: true }

      if (permanent) {
        form.media_id = mediaId
        form.access_token = data.access_token
        options.body = form
      } else {
        if (type === "video") {
          url = url.replace("https://", "http://")
        }

        url += "&media_id=" + mediaId
      }

      if (type === "news" || type === "video") {
        request(options)
          .then((response) => {
            let _data = response.body

            if (_data) {
              resolve(_data)
            } else {
              throw new Error("fetch material fails")
            }
          })
          .catch((err) => {
            reject(err)
          })
      } else {
        resolve(url)
      }
    })
  })
}

Wechat.prototype.deleteMaterial = function (mediaId) {
  let form = {
    media_id: mediaId,
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url =
        api.permanent.del +
        "access_token=" +
        data.access_token +
        "&media_id=" +
        mediaId

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Delete material fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.updateMaterial = function (mediaId, news) {
  let form = {
    media_id: mediaId,
  }

  _.extend(form, news)

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url =
        api.permanent.update +
        "access_token=" +
        data.access_token +
        "&media_id=" +
        mediaId

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Delete material fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.countMaterial = function () {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.permanent.count + "access_token=" + data.access_token

      request({ method: "GET", url: url, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Count material fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.batchMaterial = function (options) {
  options.type = options.type || "image"
  options.offset = options.offset || 0
  options.count = options.count || 1

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.permanent.batch + "access_token=" + data.access_token

      request({ method: "POST", url: url, body: options, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("batch material fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.createGroup = function (name) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.group.create + "access_token=" + data.access_token
      let form = {
        group: {
          name: name,
        },
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("create group material fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.fetchGroups = function () {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.group.fetch + "access_token=" + data.access_token

      request({ url: url, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Fetch group fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.checkGroup = function (openId) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.group.check + "access_token=" + data.access_token
      let form = {
        openid: openId,
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Check group fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.updateGroup = function (id, name) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.group.update + "access_token=" + data.access_token
      let form = {
        group: {
          id: id,
          name: name,
        },
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Update group fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.moveGroup = function (openIds, to) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url
      let form = {
        to_groupid: to,
      }

      if (_.isArray(openIds)) {
        url = api.group.batchupdate + "access_token=" + data.access_token
        form.openid_list = openIds
      } else {
        url = api.group.move + "access_token=" + data.access_token
        form.openid = openIds
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Move group fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.deleteGroup = function (id) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.group.del + "access_token=" + data.access_token
      let form = {
        group: {
          id: id,
        },
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Delete group fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.remarkUser = function (openId, remark) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.user.remark + "access_token=" + data.access_token
      let form = {
        openid: openId,
        remark: remark,
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Remark user fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.fetchUsers = function (openIds, lang) {
  lang = lang || "zh_CN"

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let options = {
        json: true,
      }

      if (_.isArray(openIds)) {
        options.url = api.user.batchFetch + "access_token=" + data.access_token
        options.body = {
          user_list: openIds,
        }
        options.method = "POST"
      } else {
        options.url =
          api.user.fetch +
          "access_token=" +
          data.access_token +
          "&openid=" +
          openIds +
          "&lang=" +
          lang
      }

      request(options)
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Fetch user fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.listUsers = function (openId) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.user.list + "access_token=" + data.access_token

      if (openId) {
        url += "&next_openid=" + openId
      }

      request({ url: url, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("List user fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.sendByGroup = function (type, message, groupId) {
  let msg = {
    filter: {},
    msgtype: type,
  }

  msg[type] = message
  if (type === "mpnews") {
    msg["send_ignore_reprint"] = 0
  }

  if (!groupId) {
    msg.filter.is_to_all = true
  } else {
    msg.filter = {
      is_to_all: false,
      tag_id: groupId,
    }
  }

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.mass.group + "access_token=" + data.access_token
      console.log("msg: " + JSON.stringify(msg))
      request({ method: "POST", url: url, body: msg, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Send to group fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.sendByOpenId = function (type, message, openIds) {
  let msg = {
    msgtype: type,
    touser: openIds,
  }

  msg[type] = message

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.mass.openId + "access_token=" + data.access_token

      request({ method: "POST", url: url, body: msg, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Send By Openid fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.deleteMass = function (msgId) {
  return new Promise(function (resolve, reject) {
    this.fetchAccessToken().then((data) => {
      let url = api.mass.del + "access_token=" + data.access_token
      let form = {
        msg_id: msgId,
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Delete mass fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.previewMass = function (type, message, openId) {
  let msg = {
    msgtype: type,
    touser: openId,
  }

  msg[type] = message

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.mass.preview + "access_token=" + data.access_token

      request({ method: "POST", url: url, body: msg, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Preview mass fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.checkMass = function (msgId) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.mass.check + "access_token=" + data.access_token
      let form = {
        msg_id: msgId,
      }

      request({ method: "POST", url: url, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Check mass fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.createMenu = function (menu) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.menu.create + "access_token=" + data.access_token

      request({ method: "POST", url: url, body: menu, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Create menu fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.getMenu = function (menu) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.menu.get + "access_token=" + data.access_token

      request({ url: url, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Get menu fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.deleteMenu = function () {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.menu.del + "access_token=" + data.access_token

      request({ url: url, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Delete menu fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.getCurrentMenu = function () {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.menu.current + "access_token=" + data.access_token

      request({ url: url, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Get current menu fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.createQrcode = function (qr) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.qrcode.create + "access_token=" + data.access_token

      request({ method: "POST", url: url, body: qr, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Create qrcode fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.showQrcode = function (ticket) {
  return api.qrcode.show + "ticket=" + encodeURI(ticket)
}

Wechat.prototype.createShorturl = function (action, url) {
  action = action || "long2short"

  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let shorurl = api.shortUrl.create + "access_token=" + data.access_token
      let form = {
        action: action,
        long_url: url,
      }

      request({ method: "POST", url: shorurl, body: form, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Create shorturl fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.semantic = function (semanticData) {
  return new Promise((resolve, reject) => {
    this.fetchAccessToken().then((data) => {
      let url = api.semanticUrl + "access_token=" + data.access_token
      semanticData.appid = data.appID

      request({ method: "POST", url: url, body: semanticData, json: true })
        .then((response) => {
          let _data = response.body

          if (_data) {
            resolve(_data)
          } else {
            throw new Error("Semantic fails")
          }
        })
        .catch((err) => {
          reject(err)
        })
    })
  })
}

Wechat.prototype.fetchTicket = function (access_token) {
  var that = this

  return this.getTicket()
    .then(function (data) {
      try {
        data = JSON.parse(data)
      } catch (e) {
        return that.updateTicket(access_token)
      }

      if (that.isValidTicket(data)) {
        return Promise.resolve(data)
      } else {
        return that.updateTicket(access_token)
      }
    })
    .then(function (data) {
      that.saveTicket(data)

      return Promise.resolve(data)
    })
}

Wechat.prototype.isValidTicket = function (data) {
  if (!data || !data.ticket || !data.expires_in) {
    return false
  }

  var ticket = data.ticket
  var expires_in = data.expires_in
  var now = new Date().getTime()

  if (ticket && now < expires_in) {
    return true
  } else {
    return false
  }
}

Wechat.prototype.updateTicket = function (access_token) {
  let url = api.ticket.get + "&access_token=" + access_token + "&type=jsapi"

  return new Promise((resolve, reject) => {
    request({ url: url, json: true }).then((response) => {
      var data = response.body
      var now = new Date().getTime()
      var expires_in = now + (data.expires_in - 20) * 1000

      data.expires_in = expires_in

      resolve(data)
    })
  })
}

Wechat.prototype.reply = function (content, message, res) {
  let xml = util.tpl(content, message)
  res.status(200).type("application/xml").send(xml)
}

Wechat.prototype.getOpenId = function (url) {
  return new Promise((resolve, reject) => {
    request({ url, json: true }).then((response) => {
      var data = response.body
      resolve(data)
    })
  })
}

Wechat.prototype.getUserInfo = function (url) {
  return new Promise((resolve, reject) => {
    request({ url, json: true }).then((response) => {
      var data = response.body
      resolve(data)
    })
  })
}

module.exports = Wechat
