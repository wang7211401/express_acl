module.exports = [
  {
    roles: "normal", // 一般用户
    allows: [{ resources: ["/admin/api/user"], permissions: ["get"] }],
  },
  {
    roles: "member", // 会员
    allows: [
      { resources: ["/admin/api/user","/admin/sign"], permissions: ["get"] },
      {
        resources: [
          "/admin/api/creat"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "company", // 高级会员
    allows: [
      { resources: ["/admin/api/user","/admin/sign"], permissions: ["get"] },
      {
        resources: [
          "/admin/api/creat"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "admin", // 管理
    allows: [
      {
        resources: ["/admin/api/user","/admin/sign"],
        permissions: ["get"],
      },
      {
        resources: [
          "/admin/api/creat"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "root", // 最高权限
    allows: [
      {
        resources: ["/admin/api/user","/admin/sign"],
        permissions: ["get"],
      },
      {
        resources: [
          "/admin/api/creat"
        ],
        permissions: ["post"],
      },
    ],
  },
]
