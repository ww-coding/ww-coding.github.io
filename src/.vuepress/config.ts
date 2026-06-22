import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { viteBundler } from '@vuepress/bundler-vite'

export default defineUserConfig({
  base: "/",

  lang: "zh-CN",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
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
