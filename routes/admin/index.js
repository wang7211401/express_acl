module.exports = (app, acl) => {
  const express = require("express")
  const jwt = require("jsonwebtoken")
  const assert = require("http-assert")
  var ok = require("assert")
  const AdminUser = require("../../models/AdminUser")
  const AdminVote = require("../../models/Vote")
  const AdminVoteItem = require("../../models/VoteItem")
  const AdminVoteRule = require("../../models/VoteRule")
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

  // const multer = require("multer")

  // const upload = multer({
  //   dest: __dirname + "../../../uploads",
  // })

  // app.post(
  //   "/admin/api/upload",
  //   authMiddleware(),
  //   upload.single("file"),
  //   async (req, res) => {
  //     const file = req.file
  //     file.url = `http://127.0.0.1:3000/uploads/${file.filename}`
  //     res.send(file)
  //   }
  // )

  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body
    console.log(username, password)
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
    console.log(username)
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
  // 创建投票
  app.post(
    "/admin/api/create",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      console.log(req.body)
      const { title, start_time, end_time, content } = req.body
      if (!title || !start_time || !end_time) {
        return res.status(422).send({ code: 0, msg: "内容不能为空！" })
      }

      const newVote = await AdminVote.create({
        title,
        start_time,
        end_time,
        content,
      })

      const newVoteRule = await AdminVoteRule.create({
        voteId: newVote._id,
      })

      res.send({ code: 1, data: { id: newVote._id }, msg: "创建成功" })
    }
  )

  // 选手设置
  app.post(
    "/admin/api/item/create/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      let cover_url = "https://i.loli.net/2020/05/19/U7txe24LPd1rDBk.png"
      let voteId = req.params.id
      let newVoteItem = await AdminVoteItem.create({
        voteId,
        cover_url,
      })
      console.log(newVoteItem)
      res.send({ code: 1, data: { vote_item: newVoteItem }, msg: "添加成功" })
    }
  )
  // 高级设置

  app.post(
    "/admin/api/more/:id",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      const voteMore = await AdminVoteRule.findOneAndUpdate(
        { voteId: req.params.id },
        req.body
      )
      console.log(voteMore)
      res.send({ code: 1, msg: "保存成功" })
    }
  )

  app.get(
    "/admin/api/user",
    authMiddleware(),
    privilegeMiddleware(acl),
    async (req, res) => {
      res.send({ code: 1, user: req.user })
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
