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
    {
      text: "Codex",
      icon: "robot",
      prefix: "Codex/",
      link: "/data/开发工具/Codex.html",
      collapsible: true,
      expanded: true,
      children: [
        "快速开始",
        "版本控制",
        "工作区与Worktree",
        "代码修改与审查",
        "技能Skills",
        "插件Plugins",
        "MCP",
        "自动化",
        "常见问题",
      ],
    },
  ],

  "/openSource/": [
    "",
    {
      text: "学习资源",
      icon: "book-open",
      prefix: "学习资源/",
      link: "学习资源/",
      collapsible: true,
      expanded: true,
      children: ["Hello算法"],
    },
    {
      text: "开发框架",
      icon: "code-branch",
      prefix: "开发框架/",
      link: "开发框架/",
      collapsible: true,
      expanded: true,
      children: ["若依"],
    },
    {
      text: "开发工具",
      icon: "toolbox",
      prefix: "开发工具/",
      link: "开发工具/",
      collapsible: true,
      expanded: true,
      children: ["DBX", "Electerm"],
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
