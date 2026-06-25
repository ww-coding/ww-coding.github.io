import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/data/Java/": [
    "",
    "面试",
    "Java并发",
    {
      text: "JVM",
      icon: "memory",
      prefix: "JVM/",
      children: "structure",
    },
  ],

  "/data/J2EE/": [
    "",
    "Spring",
    {
      text: "SpringBoot",
      icon: "leaf",
      prefix: "SpringBoot/",
      children: "structure",
    },
  ],

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

  "/data/消息队列/": [
    "",
    "Kafka",
    {
      text: "RocketMQ",
      icon: "paper-plane",
      prefix: "RocketMQ/",
      children: "structure",
    },
  ],

  "/data/前端框架/": [
    "",
    "Vue",
    {
      text: "Vue 进阶",
      icon: "code",
      prefix: "Vue/",
      children: "structure",
    },
  ],

  "/data/系统架构/": ["", "限流"],

  "/data/开发工具/": ["", "Git"],

  "/data/自我修养/": ["", "数据结构", "算法", "设计模式"],

  "/data/Java工具类/": ["", "工具"],

  "/data/Web框架/": ["", "WebSocket"],

  "/data/容器服务/": ["", "Linux"],

  "/data/真实案例分析/": [
    "",
    "OOM真实生产分析",
    "mysql字符集导致left join出现Using join buffer (Block Nested Loop)",
  ],

  "/data/": [
    {
      text: "学习笔记总览",
      icon: "book-open",
      children: [
        "Java/",
        "J2EE/",
        "数据库/",
        "消息队列/",
        "前端框架/",
        "系统架构/",
        "开发工具/",
        "自我修养/",
        "Java工具类/",
        "Web框架/",
        "容器服务/",
        "真实案例分析/",
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
