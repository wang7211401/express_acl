module.exports = function auth(acl) {
  return async function (req, res, next) {
    let resource = req.baseUrl
    if (req.route) {
      // 正常在control中使用有route属性 但是使用app.use则不会有
      resource = resource + req.route.path
    }
    console.log("resource", resource)

    // 容错 如果访问的是 /admin/sign/ 后面为 /符号认定也为过
    if (resource[resource.length - 1] === "/") {
      resource = resource.slice(0, -1)
    }

    let role = await acl.hasRole(String(req.user._id), "root")

    if (role) {
      return next()
    }

    let result = await acl.isAllowed(
      String(req.user._id),
      resource,
      req.method.toLowerCase()
    )
    if (!result) {
      let err = {
        errorCode: 401,
        message: "用户未授权访问",
      }
      return res.status(401).send({
        code: 0,
        msg: err.message,
      })
    }
    next()
  }
}
