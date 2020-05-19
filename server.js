var express = require("express")
var bodyParser = require("body-parser")
var app = express()

app.set("secret", "y2wierwq48y3q9n")
app.use(require("cors")())
app.use(express.json())

app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use("/uploads", express.static(__dirname + "/uploads"))

require("./plugins/db")(app).then((acl) => {
  require("./routes/admin")(app, acl)
})

app.listen(3000, () => {
  console.log("listening on port 3000")
})
