# yulesuangua 当前目标与进度

## 当前任务

继续把网站从“静态玄学工具展示”推进到“可真实运行的产品 MVP”。本阶段修正宝宝起名工具的结果表达：起名结果不能是截图中那种纯文字纵向堆叠，而要用“起名排盘”的形式呈现，包含四柱命盘、五行补益、用神避用、候选名落盘和命名建议。

## 成功标准

- `/tools/qiming` 不再只是固定候选名文本，而是根据输入的姓氏、性别、农历生日、出生时辰和偏好变化。
- 起名结果必须用排盘形式展示八字/五行依据：四柱、日主、农历信息、用神、避用、五行补益方向。
- 候选名必须以结构化“候选名盘”呈现，不能退回长段纯文字。
- 页面具备加载状态、错误状态、兜底状态、空状态和可访问的状态提示。
- 不写入 `localStorage`，不自动保存到 D1，不调用 `/api/consultations`。
- `npm run build` 通过，Cloudflare Function 语法检查通过。
- 使用浏览器验证 `/tools/qiming` 桌面端和移动端可用、无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 验证后推送到 GitHub，并部署到 Cloudflare Pages，生产域名可打开。

## 架构思路

- 保留现有 Vue 3 + Vite + Cloudflare Pages Functions 架构。
- 前端 `ToolPage.vue` 的起名工具调用已有 `calculateChart('bazi', { profile })`，复用后端八字排盘能力，避免新增隐私存储链路。
- 起名候选生成保持前端本页规则 MVP：根据八字 highlights/rows/raw 提取五行倾向、日主、用神，再映射到候选字库和标签。
- 起名结果组件拆成命名盘头部、四柱排盘、五行补益、候选名盘四个层级。
- 后续可把候选名算法下沉为 `/api/tools/qiming`，但当前 MVP 不引入数据库和记录保存。

## 进度记录

### 2026-07-07

- 已确认仓库位于 `ae3287b`，工作区干净。
- 已重写本文件为 UTF-8，避免旧进度文件在终端中乱码影响后续维护。
- 已完成起名页动态化实现：新增出生时辰、提交禁用、加载/错误/空状态、八字依据展示；生成名册会调用八字排盘接口，失败时使用本页规则兜底。
- 已完成初步验证：`npm run build` 通过，`node --check frontend/functions/api/[[path]].js` 通过；隐私扫描未发现工具页本地记录或自动保存调用。
- 已确认生产 API `https://suangua.weiyiai.top/api/metaphysics/calculate` 能返回八字结构，包含农历、四柱、日主和用神。
- 已完成浏览器端验证：`/tools/qiming` 桌面端和 390px 移动端均能触发真实八字 API，显示 `mingyu-core@0.1.8` 来源、日主、用神、农历和 6 张候选名卡；无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 已提交并推送代码：`fae9f01 feat: connect naming tool to bazi analysis`。
- 已部署 Cloudflare Pages，预览地址：`https://c9224745.yulesuangua.pages.dev`。
- 已完成生产验收：`https://suangua.weiyiai.top/tools/qiming` 返回 200，移动端浏览器提交起名表单可触发真实八字 API，显示 `mingyu-core@0.1.8`、日主、用神、农历和 6 张候选名卡；无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 已继续实现黄历/每日运势动态化：后端 `/api/metaphysics/calculate` 新增 `daily-fortune`，返回农历、年月日时干支、节气、宜忌、吉时、方位、颜色和桌面建议；前端 `/tools/huangli` 改为异步加载黄历盘，支持日期切换、加载状态、错误兜底和移动端布局。
- 已完成验证：`npm run build` 通过，`node --check frontend/functions/api/[[path]].js` 通过；后端直接调用 `daily-fortune` 返回 `rules-mvp+mingyu-core@2026-07`、农历、干支、节气、4 条宜、4 条忌；本地 Pages dev 浏览器验证桌面端和 390px 移动端均能渲染黄历数据、触发 API、无横向溢出、无控制台错误、无 `qk_` 本地记录。随后补了 Asia/Shanghai 默认日期修正，并复测构建、语法和后端直接调用通过。
- 已提交并推送代码：`5a40bab feat: add dynamic almanac data`。
- 已部署 Cloudflare Pages，预览地址：`https://d3edc697.yulesuangua.pages.dev`。
- 已完成生产验收：`https://suangua.weiyiai.top/tools/huangli` 返回 200，移动端浏览器自动调用 `daily-fortune`，显示 `rules-mvp+mingyu-core@2026-07`、农历、干支、节气、宜忌、吉时和方位；无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 下一步：补全周易 64 卦经典卦辞/爻辞，或做微信浏览器专项兼容。

### 2026-07-07 起名排盘修正

- 用户反馈宝宝起名结果仍像纯文字版本，需要改成排盘形式。
- 当前目标：把 `/tools/qiming` 结果区改成起名命盘，展示四柱、五行、用神、补益、候选名落盘；保持八字 API、隐私策略和移动端适配不变。
- 已定位根因：`NameBoard` 是 `script setup` 内的子组件，父组件的 `scoped` CSS 只作用到子组件根节点，内部四柱/候选名样式未生效，导致视觉退回纯文字流。
- 已完成修复：起名结果改为“起名命盘”结构，包含四柱命名盘表、五行补益盘、用神/避用规则、候选名盘卡；内部样式使用 `:deep()` 穿透到子组件 DOM。
- 已完成本地验证：`npm run build` 通过；桌面端和 390px 移动端提交 `/tools/qiming` 后均显示 6 行四柱表、5 行五行盘和 6 张候选名卡；无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 已提交并推送代码：`86af9b0 feat: render naming results as plate`。
- 已部署 Cloudflare Pages，预览地址：`https://78769d76.yulesuangua.pages.dev`。
- 已完成生产验收：`https://suangua.weiyiai.top/tools/qiming` 返回 200，移动端浏览器提交后显示 6 行四柱命名盘、5 行五行补益盘和 6 张候选名盘卡；API 来源 `mingyu-core@0.1.8`，无横向溢出、无控制台错误、无 `qk_` 本地记录。

### 2026-07-07 全站视觉审查与同类问题修复

- 当前任务：审查全站核心工具页和术法页，识别是否还有类似宝宝起名的“组件样式写了但线上实际像纯文字”的问题。
- 成功标准：浏览器自动化覆盖首页、黄历、起名、梦境、灵签、周易起卦和核心术法页；输出问题清单；优先修复因 `scoped CSS` 与内联子组件导致的结果区样式失效；保持无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 架构思路：先用 Playwright 对桌面端和 390px 移动端做 DOM/样式/隐私检查；对 `ToolPage.vue` 内的 `defineComponent` 子组件使用 `:deep()` 或改为模板内结构，避免父级 scoped 样式失效。
- 已完成审查：桌面端和 390px 移动端覆盖首页、黄历、起名、灵签、梦境、周易、八字、奇门、紫微、梅花；全部无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 已发现同类问题：`/tools/huangli` 的 `AlmanacBoard` 同样是内联子组件，`.almanac-hero-card`、`.almanac-meta`、`.almanac-grid` 实际 display 为 `block`，黄历盘样式未穿透。
- 已完成修复：为 `AlmanacBoard`、`PanelHead`、`ResultBlock` 增加 `:deep()` 样式穿透；复测黄历桌面端和移动端均显示 grid 布局，起名排盘无回归。
- 已提交并推送代码：`52b357d fix: apply tool child component styles`。
- 已部署 Cloudflare Pages，预览地址：`https://ad959d06.yulesuangua.pages.dev`。
- 已完成生产验收：`https://suangua.weiyiai.top/tools/huangli` 与 `/tools/qiming` 返回 200；黄历结果区在桌面端和 390px 移动端均为 grid 盘面；宝宝起名提交后调用 `/api/metaphysics/calculate` 返回 200，排盘来源 `mingyu-core@0.1.8`，生成 6 张候选名盘卡；无横向溢出、无控制台错误、无 `qk_` 本地记录。
