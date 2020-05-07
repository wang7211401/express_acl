module.exports = (app) => {
  return new Promise((resolve, reject) => {
    const mongoose = require("mongoose")
    const roles = require("./roles")
    mongoose.connect(
      "mongodb://127.0.0.1:27017/node-admin",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (err) => {
        if (err) {
          reject(err)
        }

        let acl = roles(mongoose.connection.db)
        resolve(acl)
      }
    )
  })

  // mongoose.connection.on("open", function (ref) {
  //   console.log("Lets do this to " + dbconnection.connection.db)
  //   acl = new acl(new acl.mongodbBackend(dbconnection.connection.db, "acl_"))

  //   acl.allow(aclConfig)
  // })
  // mongoose.connection.on("error", function (err) {
  //   console.log("Could not connect to mongo server!")
  //   console.log(err)
  // })
}
