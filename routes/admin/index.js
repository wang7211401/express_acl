module.exports = (app, acl) => {
  const express = require("express")
  const jwt = require("jsonwebtoken")
  const assert = require("http-assert")
  var ok = require("assert")
  const AdminUser = require("../../models/AdminUser")
  const AdminVote = require("../../models/Vote")
  const AdminVoteItem = require("../../models/VoteItem")
  const AdminVoteType = require("../../models/VoteType")
  const AdminVoteRule = require("../../models/VoteRule")
  const { plugin } = require("../../plugins/plugin")
  const router = express.Router({
    mergeParams: true,
  })

  //   router.post("/", async (req, res) => {
  //     const model = await req.Model.create(req.body)
  //     res.send(model)
  //   })

  //   router.put("/:id", async (req, res) => {
  //     const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
  //     res.send(model)
  //   })

  //   router.delete("/:id", async (req, res) => {
  //     await req.Model.findByIdAndDelete(req.params.id)
  //     res.send({
  //       success: true,
  //     })
  //   })

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

  //   router.get("/:id", async (req, res) => {
  //     const model = await req.Model.findById(req.params.id)
  //     res.send(model)
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
    // assert(user, 422, '用户不存在')
    // try {

    // } catch (err) {
    //   ok(err.status === 422)
    //   ok(err.message === '用户不存在')
    //   ok(err.expose)
    // }

    // 校验密码
    // const isValid = require('md5')(password) != user.password

    // assert(isValid, 422, '密码错误')
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
