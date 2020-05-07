var acl = require("acl")
const aclConfig = require("../config/acl_conf")
module.exports = (db) => {
  acl = new acl(new acl.mongodbBackend(db, "acl_"))
  // 为guest、user、admin角色添加权限
  acl.allow(aclConfig)
  return acl
}
