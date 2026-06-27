import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  pagePatterns: [
    "README.md",
    "data/README.md",
    "data/数据库/**/*.md",
    "data/开发工具/**/*.md",
    "project/**/*.md",
    "openSource/**/*.md",
  ],
  // title: "文档演示",
  // description: "vuepress-theme-hope 的文档演示",

  theme,
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
  // Enable it with pwa
  // shouldPrefetch: false,
});
