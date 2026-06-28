import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/data/数据库/": [
    "",
    {
      text: "Mysql",
      icon: "database",
      prefix: "Mysql/",
      link: "Mysql/",
      collapsible: true,
      expanded: true,
      children: [
        "Mysql基础",
        "Mysql优化",
        "Mysql面试题",
      ],
    },
    {
      text: "Redis",
      icon: "server",
      prefix: "Redis/",
      link: "Redis/",
      collapsible: true,
      expanded: true,
      children: [
        "Redis基础",
        "Redis数据类型",
        "Redis特殊数据类型",
        "Redis持久化",
        "Redis进阶",
        "Redis实战",
      ],
    },
  ],

  "/data/开发工具/": [
    "",
    {
      text: "Git",
      icon: "code-branch",
      prefix: "Git/",
      link: "../Git",
      collapsible: true,
      expanded: true,
      children: [
        "基础操作",
        "分支管理",
        "问题排查",
        "高级操作",
      ],
    },
  ],

  "/data/": [
    {
      text: "学习笔记总览",
      icon: "book-open",
      children: [
        "数据库/",
        "开发工具/",
      ],
    },
  ],

  "/project/": [
    "",
    {
      text: "原创实战项目",
      icon: "rocket",
      children: "structure",
    },
  ],
});
