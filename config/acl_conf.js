module.exports = [
  {
    roles: "normal", // 一般用户
    allows: [{ resources: ["/admin/reserve"], permissions: ["get"] }],
  },
  {
    roles: "member", // 会员
    allows: [
      { resources: ["/admin/reserve", "/admin/sign"], permissions: ["get"] },
      {
        resources: [
          "/admin/reserve/add-visitor",
          "/admin/reserve/add-visitor-excel",
          "/admin/reserve/audit",
          "/admin/sign/ban",
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "company", // 高级会员
    allows: [
      { resources: ["/admin/reserve", "/admin/sign"], permissions: ["get"] },
      {
        resources: [
          "/admin/reserve/add-visitor",
          "/admin/reserve/add-visitor-excel",
          "/admin/reserve/audit",
          "/admin/sign/ban",
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "admin", // 管理
    allows: [
      {
        resources: ["/admin/reserve", "/admin/sign", "/admin/set"],
        permissions: ["get"],
      },
      {
        resources: ["/admin/set/add-user", "/admin/set/modify-user"],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "root", // 最高权限
    allows: [
      {
        resources: ["/admin/reserve", "/admin/sign", "/admin/set"],
        permissions: ["get"],
      },
    ],
  },
]
