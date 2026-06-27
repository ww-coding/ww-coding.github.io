import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/data/数据库/": [
    "",
    {
      text: "Mysql",
      icon: "database",
      prefix: "Mysql/",
      children: "structure",
    },
    {
      text: "Redis",
      icon: "server",
      prefix: "Redis/",
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

  "/data/开发工具/": ["", "Git"],

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
