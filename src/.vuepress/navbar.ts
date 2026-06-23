import { navbar } from "vuepress-theme-hope";

export default navbar([
  {
    text: "学习笔记",
    icon: "book-open",
    prefix: "/data/",
    children: [
      { text: "Java 后端", icon: "coffee", link: "Java/" },
      { text: "J2EE / Spring", icon: "leaf", link: "J2EE/" },
      { text: "数据库", icon: "database", link: "数据库/" },
      { text: "消息队列", icon: "stream", link: "消息队列/" },
      { text: "前端框架", icon: "code", link: "前端框架/" },
      { text: "系统架构", icon: "sitemap", link: "系统架构/" },
      { text: "开发工具", icon: "toolbox", link: "开发工具/" },
      { text: "自我修养", icon: "seedling", link: "自我修养/" },
    ],
  },
  {
    text: "实战项目",
    icon: "rocket",
    link: "/project/",
  },
  {
    text: "资源推荐",
    icon: "box-open",
    children: [
      { text: "开源项目", icon: "code-branch", link: "/openSource/" },
      // { text: "导航总览", icon: "signs-post", link: "/menu/" },
    ],
  },
]);
