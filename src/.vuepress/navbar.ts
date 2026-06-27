import { navbar } from "vuepress-theme-hope";

export default navbar([
  {
    text: "学习笔记",
    icon: "book-open",
    prefix: "/data/",
    children: [
      { text: "数据库", icon: "database", link: "数据库/" },
      { text: "开发工具", icon: "toolbox", link: "开发工具/" },
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
