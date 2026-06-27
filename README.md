<p align="center">
  <img src="src/.vuepress/public/logo.svg" alt="无畏编码 Logo" width="120" />
</p>

<h1 align="center">无畏编码</h1>

> 记录写代码路上的实践、踩坑、复盘和思考，保持好奇，持续成长。

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-online-brightgreen)](https://ww-coding.github.io/)
[![VuePress](https://img.shields.io/badge/VuePress-2.x-3eaf7c)](https://v2.vuepress.vuejs.org/)
[![Theme Hope](https://img.shields.io/badge/vuepress--theme--hope-2.x-46bd87)](https://theme-hope.vuejs.press/zh/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

这是一个基于 VuePress 2 和 vuepress-theme-hope 搭建的个人技术博客，主要沉淀后端开发、数据库、开发工具、系统架构、真实案例分析以及实战项目相关内容。

## 在线访问

- 博客地址：[https://ww-coding.github.io/](https://ww-coding.github.io/)
- GitHub 仓库：[ww-coding.github.io](https://github.com/ww-coding/ww-coding.github.io)

## 内容导航

- [学习笔记](https://ww-coding.github.io/data/)：数据库、开发工具等体系化笔记
- [数据库](https://ww-coding.github.io/data/%E6%95%B0%E6%8D%AE%E5%BA%93/)：MySQL、Redis 等数据库相关内容
- [实战项目](https://ww-coding.github.io/project/)：项目实践、开发记录与复盘
- [资源推荐](https://ww-coding.github.io/openSource/)：开源项目与学习资源整理

## 技术栈

- [VuePress 2](https://v2.vuepress.vuejs.org/)：静态站点生成
- [vuepress-theme-hope](https://theme-hope.vuejs.press/zh/)：博客主题与文档能力
- [Vite](https://vite.dev/)：构建与开发服务
- [Giscus](https://giscus.app/)：基于 GitHub Discussions 的评论系统

## 快速开始

### 环境要求

- Node.js 18 或更高版本
- npm

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run docs:dev
```

如需清理 VuePress 缓存后启动：

```bash
npm run docs:clean-dev
```

### 构建站点

```bash
npm run docs:build
```

构建产物默认输出到：

```text
src/.vuepress/dist
```

## 项目结构

```text
.
├── .github/workflows/          # GitHub Actions 自动部署配置
├── scripts/                    # 构建前辅助脚本
│   └── ensure-image-public-link.cjs
├── src/
│   ├── .vuepress/              # VuePress 站点配置、主题配置与静态资源
│   ├── data/                   # 学习笔记
│   ├── images/                 # 文章图片资源
│   ├── openSource/             # 开源项目与资源推荐
│   ├── project/                # 实战项目文档
│   └── README.md               # 博客首页
├── package.json
└── README.md
```

## 写作约定

- 站点源码位于 `src` 目录，博客首页对应 `src/README.md`。
- 文章图片统一放在 `src/images`，构建前脚本会将其链接到 `src/.vuepress/public/images`，方便在 Markdown 中以 `/images/xxx.png` 形式引用。
- 当前站点通过 `src/.vuepress/config.ts` 的 `pagePatterns` 控制纳入构建的页面范围。
- 导航栏与侧边栏分别维护在 `src/.vuepress/navbar.ts` 和 `src/.vuepress/sidebar.ts`。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run docs:dev` | 启动本地开发服务 |
| `npm run docs:clean-dev` | 清理缓存后启动本地开发服务 |
| `npm run docs:build` | 构建生产环境静态文件 |
| `npm run docs:update-package` | 使用 `vp-update` 更新 VuePress 相关依赖 |

## 部署

项目通过 GitHub Pages 发布。推送到主分支后，GitHub Actions 会构建 VuePress 站点并部署到：

```text
https://ww-coding.github.io/
```

## License

本项目使用 MIT 协议。
