module.exports = [
  {
    roles: "normal", // 一般用户
    allows: [
      { resources: ["/admin/api/user","/admin/api/vote/list"], permissions: ["get"] },
      {
        resources: [
          "/admin/api/create",
          "/admin/api/more/:id",
          "/admin/api/item/create/:id",
          "/admin/api/item/update/:id",
          "/admin/api/item/delete/:id",
          "/admin/api/upload/:id"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "member", // 会员
    allows: [
      { resources: ["/admin/api/user", "/admin/sign","/admin/api/vote/list"], permissions: ["get"] },
      {
        resources: [
          "/admin/api/create",
          "/admin/api/more/:id",
          "/admin/api/item/create/:id",
          "/admin/api/item/update/:id",
          "/admin/api/item/delete/:id",
          "/admin/api/upload/:id"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "company", // 高级会员
    allows: [
      { resources: ["/admin/api/user", "/admin/sign"], permissions: ["get"] },
      {
        resources: [
          "/admin/api/create",
          "/admin/api/more/:id",
          "/admin/api/item/create/:id",
          "/admin/api/item/update/:id",
          "/admin/api/item/delete/:id",
          "/admin/api/upload/:id"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "admin", // 管理
    allows: [
      {
        resources: ["/admin/api/user", "/admin/sign"],
        permissions: ["get"],
      },
      {
        resources: [
          "/admin/api/create",
          "/admin/api/more/:id",
          "/admin/api/item/create/:id",
          "/admin/api/item/update/:id",
          "/admin/api/item/delete/:id",
          "/admin/api/upload/:id"
        ],
        permissions: ["post"],
      },
    ],
  },
  {
    roles: "root", // 最高权限
    allows: [
      {
        resources: ["/admin/api/user", "/admin/sign"],
        permissions: ["get"],
      },
      {
        resources: [
          "/admin/api/create",
          "/admin/api/more/:id",
          "/admin/api/item/create/:id",
          "/admin/api/item/update/:id",
          "/admin/api/item/delete/:id",
          "/admin/api/upload/:id"
        ],
        permissions: ["post"],
      },
    ],
  },
]
