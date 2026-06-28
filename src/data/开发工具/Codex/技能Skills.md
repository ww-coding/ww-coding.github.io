---
title: 技能 Skills
icon: wand-magic-sparkles
category:
  - Codex
tag:
  - Skills
  - 工作流
---

# 技能 Skills

Skills 是 Codex 的可复用工作流。它可以把某类任务的步骤、规则、参考资料和脚本固定下来，让 Codex 在相似任务中按同一套方法执行。

![Codex 能力关系图](../../../images/codex/codex-capability-map.svg)

## 适合做成 Skill 的场景

- 经常重复的文档生成流程。
- 固定格式的代码审查流程。
- 项目特有的发布检查流程。
- 某类文件的处理方式，例如 PDF、Word、表格。
- 团队内部约定的开发规范。

## Skill 通常包含什么

- 什么时候应该使用这个技能。
- 执行任务的步骤。
- 需要读取的参考文件。
- 可复用脚本或模板。
- 验证结果的方法。

## 使用方式

当任务匹配某个 Skill 时，Codex 会读取对应说明，并按其中的步骤工作。

你也可以明确要求：

```text
使用文档处理相关 skill，帮我生成一份 Word 文档。
```

## 和普通提示词的区别

普通提示词适合一次性要求。

Skill 适合长期复用的流程。比如“每次写 VuePress 文档都要检查侧边栏、链接和构建”，就适合沉淀成 Skill。

## 使用步骤

1. 判断任务是否重复出现。
2. 把固定流程写成 Skill。
3. 在 Skill 中说明什么时候使用、怎么执行、怎么验证。
4. 以后遇到同类任务时，让 Codex 按 Skill 执行。

示例：

```text
以后给我的博客新增文档时，都先检查 sidebar.ts，再运行 npm run docs:build。
```
