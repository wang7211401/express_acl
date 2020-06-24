module.exports = (app, acl) => {
  const express = require("express")
  const jwt = require("jsonwebtoken")
  const sha1 = require("sha1")
  const getRawBody = require("raw-body")
  const contentType = require("content-type")
  const { redis } = require("../../plugins/dbRedis")
  const config = require("../../config/wechat_config")
  const Wechat = require("../../wechat/wechat")
  const util = require("../../wechat/util")
  const wechat_config = require("../../config/wechat_config")
  const AdminUser = require("../../models/AdminUser")
  const AdminVote = require("../../models/Vote")
  const AdminVoteItem = require("../../models/VoteItem")
  const AdminVoteType = require("../../models/VoteType")
  const AdminVoteRule = require("../../models/VoteRule")
  const { plugin } = require("../../plugins/plugin")
  const router = express.Router({
    mergeParams: true,
  })
  let wechatApi = new Wechat(config.wechat)

  app.get("/", async (req, res) => {
    let token = wechat_config.wechat.token
    let signature = req.query.signature
    let nonce = req.query.nonce
    let timestamp = req.query.timestamp
    let echostr = req.query.echostr
    let str = [token, timestamp, nonce].sort().join("")
    let sha = sha1(str)
    if (sha === signature) {
      res.send(echostr)
    } else {
      res.send("wrong")
    }
  })

  app.post("/", async (req, res) => {
    let wechat = new Wechat(wechat_config.wechat)
    let token = wechat_config.wechat.token
    let signature = req.query.signature
    let nonce = req.query.nonce
    let timestamp = req.query.timestamp
    let echostr = req.query.echostr
    let str = [token, timestamp, nonce].sort().join("")
    let sha = sha1(str)
    if (sha !== signature) {
      res.send("wrong")
    }

    var data = await getRawBody(req, {
      length: req.headers["content-length"],
      limit: "1mb",
      encoding: contentType.parse(req).parameters.charset,
    })

    var content = await util.parseXMLAsync(data)

    var message = util.formatMessage(content.xml)

    console.log("message", message)
    const msgType = message.MsgType
    const msgEvent = message.Event
    const userID = message.FromUserName
    let eventKey = message.EventKey

    let reply = ""
    // switch (msgType) {
    //   case "event":
    //     if (message.Event === "subscribe") {
    //       if (message.EventKey) {
    //         console.log(
    //           "扫二维码进来的" + message.EventKey + " " + message.Ticket
    //         )
    //       }
    //       reply = "恭喜你订阅了"
    //     } else if (message.Event === "unsubscribe") {
    //       console.log("取关")
    //       reply = ""
    //     } else if (message.Event === "SCAN") {
    //       console.log(
    //         "关注后扫二维码" + message.EventKey + " " + message.Ticket
    //       )
    //       reply = "扫一下"
    //     }
    //     break
    //   case "location":
    //     reply = `您上报的位置是:东经：${message.Location_X}，北纬：${message.Location_Y},地址：${message.Label}`
    //     break
    //   case "text":
    //     let content = message.Content
    //     if (content === "测试") {
    //       reply = "test"
    //     }
    //     break
    //   default:
    //     break
    // }
    if (msgType == "event") {
      switch (msgEvent) {
        // 关注&取关
        case "subscribe":
          return "感谢您的关注"
        case "unsubscribe":
          break
        // 关注后扫码
        case "SCAN":
          reply = "扫码成功"
          break
      }

      if (!!eventKey) {
        // 有场景值（扫了我们生成的二维码）
        let user = await wechatApi.fetchUsers(userID)
        let userInfo = `${user.nickname}（${user.sex ? "男" : "女"}, ${
          user.province
        }${user.city}）`
        console.log("userInfo", userInfo)
        if (eventKey.slice(0, 8) === "qrscene_") {
          // 扫码并关注
          // 关注就创建帐号的话可以在这里把用户信息写入数据库完成用户注册
          eventKey = eventKey.slice(8)
          console.log("eventKey", eventKey + "扫码并关注了公众号")
          // reply = "扫码并关注了公众号"
        } else {
          // 已关注
          console.log(eventKey + "扫码进入了公众号")
          // reply = "扫码并关注了公众号"
        }

        // 更新扫码记录，供浏览器扫码状态轮询
        await redis
          .pipeline()
          .hset(eventKey, "unionID", user.unionid || "") // 仅unionid机制下有效
          .hset(eventKey, "openID", user.openid)
          .exec()
      }
    }

    console.log("reply", reply)
    wechat.reply(reply, message, res)
  })

  app.get("/movie", async (req, res) => {
    const appid = config.wechat.appID
    console.log(appid)
    const redirect_uri = "http://abs.free.qydev.com/code" //这里的url需要转为加密格式，它的作用是访问微信网页鉴权接口成功后微信会回调这个地址，并把code参数带在回调地址中
    const scope = "snsapi_userinfo"
    const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=123&connect_redirect=1#wechat_redirect`
    res.status(302).redirect(`${url}`)
  })

  app.get("/code", async (req, res) => {
    const appid = config.wechat.appID
    const secret = config.wechat.appSecret
    const code = req.query.code
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`

    let options = await wechatApi.getOpenId(url)

    const userInfoUrl = `https://api.weixin.qq.com/sns/userinfo?access_token=${options.access_token}&openid=${options.openid}&lang=zh_CN`

    let userInfo = await wechatApi.getUserInfo(userInfoUrl)
    console.log(userInfo)

    res.send({
      code: 0,
      data: {
        userInfo,
      },
      msg: "",
    })
  })

  app.get("/admin/api/qrcode", async (req, res) => {
    let id = util.createTimestamp()
    let ticketOptions = await wechatApi.createQrcode({
      expire_seconds: 60,
      action_name: "QR_STR_SCENE", // 临时二维码
      action_info: {
        scene: {
          scene_str: id,
        },
      },
    })

    console.log(ticketOptions)
    let qrcodeImg = wechatApi.showQrcode(ticketOptions.ticket)
    res.send({
      code: 1,
      data: {
        qrcode: qrcodeImg,
      },
      msg: "",
    })
  })

  app.get("/admin/api/wechat/check", async (req, res) => {
    let openId = ""
    // let openId = await redis.hget()
    // await redis
    //   .pipeline()
    //   .hset("123", "unionID", "unionid123") // 仅unionid机制下有效
    //   .exec()

    // openId = await redis.hget("123", "unionID")
    res.send({
      code: 0,
      msg: "",
      data: {
        openId,
      },
      url: "",
      wait: 3,
    })
  })
  //   router.get("/", async (req, res) => {
  //     let queryOptions = {}
  //     if (req.Model.modelName === "Category") {
  //       queryOptions.populate = "parent"
  //     }
  //     const size = req.query.size || 10
  //     const page = req.query.page || 1

  //     const count = await req.Model.find().count()

  //     const items = await req.Model.find()
  //       .setOptions(queryOptions)
  //       .skip((parseInt(page) - 1) * size)
  //       .limit(size)
  //     res.send({ items, count })
  //   })

  // 登录校验
  const authMiddleware = require("../../middleware/auth")
  // 权限校验
  const privilegeMiddleware = require("../../middleware/privilege")

  // app.use(
  //   "/admin/api/rest/:resource",
  //   authMiddleware(),
  //   resourceMiddleware(),
  //   router
  // )

  const multer = require("multer")

  const upload = multer({
    dest: __dirname + "../../../uploads",
  })

  app.post(
    "/admin/api/upload",
    authMiddleware(),
    privilegeMiddleware(acl),
    upload.single("file"),
    async (req, res) => {
      const file = req.file
      const itemId = req.body.itemId || ""
      file.url = `http://127.0.0.1:3000/uploads/${file.filename}`
      res.send({
        code: 1,
        data: {
          cover_url: file.url,
          itemId,
        },
        msg: "上传成功",
      })
    }
  )

  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.send({ code: 0, msg: "用户名或密码不能为空！" })
    }
    // 根据用户名找用户
    const user = await AdminUser.findOne({
      username,
    }).select("+password")

    if (!user) {
      return res.status(422).send({ code: 0, msg: "用户不存在" })
    }
    // 校验密码
    if (require("md5")(password) != user.password) {
      return res.status(422).send({ code: 0, msg: "密码错误" })
    } else {
      // 数据token
      const token = jwt.sign(
        {
          id: user._id,
        },
        app.get("secret")
      )

      res.send({ code: 1, token })
    }
  })

  app.post("/admin/api/register", async (req, res) => {
    const { username, password, checkPassword } = req.body

    if (!username || !password || !checkPassword) {
      return res.status(422).send({ code: 0, msg: "用户名或密码不能为空！" })
    }
    if (password !== checkPassword) {
      return res.status(422).send({ code: 0, msg: "两次输入的密码不相同！" })
    }

    // 根据用户名找用户
    const user = await AdminUser.findOne({
      username,
    })

    if (user) {
      return res.status(422).send({ code: 0, msg: "用户名已存在" })
    }

    const newUser = await AdminUser.create({
      username,
      password,
    })

    acl.addUserRoles(String(newUser._id), ["member"])

    // 数据token
    const token = jwt.sign(
      {
        id: newUser._id,
      },
      app.get("secret")
    )

    res.send({ code: 1, token, msg: "注册成功" })
  })
  // 查询活动列表
  app.get(
    "/admin/api/vote/list",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const size = req.query.size || 10
      const page = req.query.page || 1

      const count = await AdminVote.find({
        userId: req.user._id,
      }).count()

      const userList = await AdminVote.find({
        userId: req.user._id,
      })
        .lean()
        .populate("userId")
        .skip((parseInt(page) - 1) * size)
        .limit(size)

      userList.forEach((val) => {
        let obj = plugin.statusObj(val.start_time, val.end_time)
        val.status = obj.status
        val.status_text = obj.status_text
        val.start_time = plugin.formatDate(val.start_time)
        val.end_time = plugin.formatDate(val.end_time)
        val.create_time = plugin.formatDate(val.create_time)
        val.update_time = plugin.formatDate(val.update_time)
      })

      res.send({
        code: 1,
        data: {
          userList,
          count,
        },
        msg: "",
      })
    }
  )
  // 查询单个投票
  app.get(
    "/admin/api/vote/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const voteItem = await AdminVote.findById(req.params.id)
      res.send({ code: 1, data: { voteItem }, msg: "" })
    }
  )
  // 创建投票
  app.post(
    "/admin/api/create",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const { title, start_time, end_time, content } = req.body
      let create_time = Date.now()
      if (!title || !start_time || !end_time) {
        return res.status(422).send({ code: 0, msg: "内容不能为空！" })
      }
      const newVote = await AdminVote.create({
        userId: req.user._id,
        title,
        start_time,
        end_time,
        content,
        create_time,
      })

      const newVoteRule = await AdminVoteRule.create({
        voteId: newVote._id,
      })

      res.send({ code: 1, data: { id: newVote._id }, msg: "创建成功" })
    }
  )
  // 修改单个投票
  app.post(
    "/admin/api/edit/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const { title, start_time, end_time, content } = req.body
      if (!title || !start_time || !end_time) {
        return res.status(422).send({ code: 0, msg: "内容不能为空！" })
      }

      const newVote = await AdminVote.findByIdAndUpdate(req.params.id, {
        title,
        start_time,
        end_time,
        content,
      })

      res.send({ code: 1, msg: "修改成功" })
    }
  )
  // 查询选手
  app.get(
    "/admin/api/item/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const size = req.query.size || 10
      const page = req.query.page || 1
      const order = req.query.order || 1
      const keyword = req.query.keyword || ""

      let voteId = req.params.id
      let count = await AdminVoteItem.find({
        voteId,
        is_del: 0,
      }).count()

      let objOrder = {}
      if (order == 1) {
        objOrder.create_time = -1
      } else if (order == 2) {
        objOrder.create_time = 1
      } else if (order == 3) {
        objOrder.vote_count = -1
      } else if (order == 4) {
        objOrder.vote_count = 1
      } else if (order == 5) {
        objOrder.index = -1
      } else if (order == 6) {
        objOrder.index = 1
      }
      let voteItemList = await AdminVoteItem.find({
        voteId,
        is_del: 0,
      })
        .sort(objOrder)
        .skip((parseInt(page) - 1) * size)
        .limit(size)

      let vote_items = voteItemList.map((val) => {
        val.create_time = plugin.formatDate(val.create_time)
        val.update_time = plugin.formatDate(val.update_time)
        console.log(plugin.formatDate(val.create_time))
        console.log(plugin.formatDate(val.update_time))
        return val
      })

      console.log(vote_items)
      res.send({ code: 1, data: { vote_items, count }, msg: "" })
    }
  )
  // 新增选手
  app.post(
    "/admin/api/item/create/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let cover_url = "https://i.loli.net/2020/05/19/U7txe24LPd1rDBk.png"
      let voteId = req.params.id
      let create_time = Date.now()

      let voteItemCount = await AdminVoteItem.find({ voteId }).count()

      console.log(voteItemCount)
      let index = voteItemCount + 1
      let newVoteItem = await AdminVoteItem.create({
        voteId,
        cover_url,
        create_time,
        index,
        vote_item_type_id: voteId,
      })

      let count = await AdminVoteItem.find({
        voteId,
        is_del: 0,
      }).count()

      await AdminVote.findByIdAndUpdate(voteId, {
        vote_item_count: count,
      })

      let local_create_time = plugin.formatDate(newVoteItem.create_time)
      let local_update_time = plugin.formatDate(newVoteItem.update_time)

      res.send({
        code: 1,
        data: { vote_item: newVoteItem, local_create_time, local_update_time },
        msg: "添加成功",
      })
    }
  )

  // 选手更新
  app.post(
    "/admin/api/item/update/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      // {
      //   itemID: '2313',
      //   tag: 'key',
      //   value:'value'
      // }

      let { itemId, tag, value } = req.body
      let obj = {}
      obj[tag] = value

      if (!itemId) {
        return res.send({ code: 0, msg: "选手id 不能为空" })
      }
      let voteItem = await AdminVoteItem.findByIdAndUpdate(itemId, obj)

      res.send({ code: 1, msg: "修改成功" })
    }
  )
  // 加票、扣票、撤销
  app.post(
    "/admin/api/item/votecount/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      // {
      //   itemID: '2313',
      //   tag: 'key',
      //   value:'value'
      // }

      let { itemId, type, value } = req.body

      if (!itemId) {
        return res.send({ code: 0, msg: "选手id 不能为空" })
      }

      let voteItem = await AdminVoteItem.findOne({ _id: itemId, is_del: 0 })

      if (!voteItem) {
        return res.send({ code: 0, msg: "选手不存在" })
      }
      console.log(voteItem)
      let vote_count = voteItem.vote_count

      if (type == 1) {
        vote_count = vote_count - Number(value)
      } else if (type == 2) {
        vote_count = vote_count + Number(value)
      }

      let newVoteItem = await AdminVoteItem.findByIdAndUpdate(itemId, {
        vote_count,
      })

      res.send({ code: 1, msg: "修改成功" })
    }
  )

  // 删除选手
  app.post(
    "/admin/api/item/delete/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let voteId = req.params.id
      let { itemId } = req.body

      if (!itemId) {
        return res.send({ code: 0, msg: "选手id不能为空" })
      }
      let voteItem = await AdminVoteItem.findByIdAndUpdate(itemId, {
        is_del: 1,
      })

      let count = await AdminVoteItem.find({
        is_del: 0,
      }).count()

      await AdminVote.findByIdAndUpdate(voteId, {
        vote_count: count,
      })

      res.send({ code: 1, msg: "删除成功" })
    }
  )

  // 查询分类
  app.get(
    "/admin/api/type/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let voteTypeList = await AdminVoteType.find({
        voteId: req.params.id,
      })
      res.send({ code: 1, data: { vote_type: voteTypeList }, msg: "" })
    }
  )
  // 新增分类
  app.post(
    "/admin/api/type/create/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let create_time = Date.now()
      let voteId = req.params.id
      let { title } = req.body
      if (!title) {
        return res.send({ code: 0, msg: "分类标题不能为空" })
      }
      let _VoteType = await AdminVoteType.findOne({
        voteId,
        title,
      })
      if (_VoteType) {
        return res.send({ code: 0, msg: "分类标题已存在" })
      }
      let newVoteType = await AdminVoteType.create({
        voteId,
        title,
        create_time,
      })

      res.send({ code: 1, data: { vote_type: newVoteType }, msg: "添加成功" })
    }
  )
  // 更新分类
  app.post(
    "/admin/api/type/update/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let voteId = req.params.id
      let { typeId, title } = req.body

      if (!typeId) {
        return res.send({ code: 0, msg: "分类id不能为空" })
      }

      let voteType = await AdminVoteType.findByIdAndUpdate(typeId, { title })

      res.send({ code: 1, msg: "修改成功" })
    }
  )

  // 删除分类
  app.post(
    "/admin/api/type/delete/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let voteId = req.params.id
      let { typeId } = req.body

      if (!typeId) {
        return res.send({ code: 0, msg: "分类id不能为空" })
      }
      let voteType = await AdminVoteType.findByIdAndDelete(typeId)

      res.send({ code: 1, msg: "删除成功" })
    }
  )

  // 查询设置
  app.get(
    "/admin/api/more/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const voteMore = await AdminVoteRule.findOneAndUpdate({
        voteId: req.params.id,
      })

      res.send({ code: 1, data: { voteMore }, msg: "" })
    }
  )
  // 高级设置
  app.post(
    "/admin/api/more/update/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const voteMore = await AdminVoteRule.findOneAndUpdate(
        { voteId: req.params.id },
        req.body
      )

      res.send({ code: 1, msg: "保存成功" })
    }
  )

  app.get(
    "/admin/api/user",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      res.send({ code: 1, data: { user: req.user }, msg: "" })
    }
  )

  app.get(
    "/admin/sign",
    authMiddleware(),
    privilegeMiddleware(acl),
    (req, res) => {
      res.send({ code: 1, user: req.user })
    }
  )

  // app.get("/admin/del", async (req, res) => {
  //   await acl.removeUserRoles("user123", ["member"])
  //   await acl.removeUserRoles("user321", ["member"])

  //   await acl.addUserRoles("5eb36cb21e563453b85fd52a", ["normal"])
  //   await acl.addUserRoles("5eb36c47fdb4e2768c08d645", ["member"])
  //   await acl.addUserRoles("5eb367a6c538b60988064b91", ["member"])
  //   res.send({ code: 1, user: req.user })
  // })

  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      code: 0,
      msg: err.message,
    })
  })
}
