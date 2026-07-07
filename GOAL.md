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
## 2026-07-07 三阶段排盘化升级

### 任务

按用户指定顺序继续完善站点：

1. 先把工具页中仍然像纯文字的结果补成盘面化 UI。
2. 再把核心术法页补成各术法专属排盘，而不是通用文本卡片。
3. 最后统一“输入 -> 结构化 chart -> AI 固定栏目解读”的数据结构，为后续真实算法和生产维护做准备。

### 成功标准

- 灵签、梦境、祈福不再只输出一段文字，必须有签盘、梦象盘、香火愿盘等结构化结果。
- 八字、奇门、紫微、梅花、六爻、风水、塔罗、小六壬、大六壬等页面应根据术法类型展示专属排盘组件。
- 结果数据统一先形成结构化 `chart`，AI 解读只消费 chart 和固定栏目，不把排盘逻辑塞进文案。
- 保持隐私策略：不写入 `localStorage`，不自动保存到 D1，不恢复“最近记录”。
- 桌面端和移动端无横向溢出、无控制台错误、可提交、可看到盘面。
- `npm run build` 和 Cloudflare Function 语法检查通过；完成后推送 GitHub 并部署 Cloudflare。

### 架构思路

- 继续保留 Vue 3 + Vite + Cloudflare Pages Functions。
- 前端优先抽出可复用的“结果盘面”小组件和 normalize 函数，减少 `ToolPage.vue` 与 `Divine.vue` 重复的文本拼接。
- 后端保持现有 `/api/metaphysics/calculate` 入口，必要时只扩展返回结构，不引入默认持久化。
- 验证采用浏览器自动化覆盖核心工具页和术法页，重点检查盘面 DOM、移动端宽度、API 返回、隐私本地存储。

### 本轮进度

- 第一步已完成：`/tools/lingqian` 改为灵签签盘，`/tools/jiemeng` 改为梦象解析盘，`/tools/xianghuo` 改为香火祈愿盘；不再只用 `ResultBlock` 输出纯文字。
- 第二步已完成本轮补强：全术法移动端提交验证覆盖八字、紫微、六爻、梅花、大六壬、小六壬、姻缘、合婚、佛学、每日运势，均生成对应 `visual-board board-* is-result` 结果盘和解读。
- 第三步已完成 MVP 数据结构：前端提交时生成 `readingChart`，包含 `version/meta/input/board/chart/facts/sections`；后端解读入口优先读取 `readingChart` 的 facts 和固定栏目。
- 已补后端 `fojiao` 规则盘，并在前端把佛学开示设为本地规则盘，避免无排盘算法页面产生 422 控制台错误。
- 已完成验证：`npm run build` 通过，`node --check frontend/functions/api/[[path]].js` 通过；工具页和术法页浏览器验证均无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 已提交并推送代码：`3977bab feat: upgrade tool and reading boards`。
- 已部署 Cloudflare Pages，预览地址：`https://a41f7186.yulesuangua.pages.dev`。
- 已完成生产验收：`https://suangua.weiyiai.top/tools/lingqian`、`/tools/jiemeng`、`/tools/xianghuo` 返回 200；线上移动端浏览器验证三页均显示新盘面；`/divine/qimen` 和 `/divine/fojiao` 提交后均生成 `visual-board board-* is-result`；新增 `fojiao` 排盘 API 返回 200；无横向溢出、无控制台错误、无 `qk_` 本地记录。

## 2026-07-07 奇门与六爻字段补强

### 任务

按下一步顺序先补强奇门遁甲，再补强六爻，让盘面字段更接近真实排盘，而不是只显示几项摘要。

### 成功标准

- 奇门九宫每格必须展示宫位、方位、五行、八神、九星、八门、天盘干、地盘干，并标记值符、值使、空亡、马星等。
- 六爻每爻必须展示爻位、阴阳、六亲、六神、纳甲、五行、世应、动爻、空亡、变爻/旺衰提示。
- 旧数组数据和新对象数据都要兼容，避免线上旧返回或本地兜底盘崩掉。
- 继续保持无本地记录、无横向溢出、无控制台错误。

### 进度

- 已重写 `frontend/src/domain/qimen.js`，清理旧数组字段限制，统一输出奇门对象字段，并保留旧数组兼容。
- 已补强 `QimenBoard.vue`，九宫格每格显示八神、九星、八门、天盘干、地盘干，并显示值符/值使/空亡/马星等标签。
- 已补强后端 `calculateQimenBoard`，直接从 `mingyu-core` 的 `tianPan/diPan/renPan/shenPan` 映射完整字段。
- 已补强六爻后端 `calculateLiuyaoBoard`，每爻返回六亲、六神、纳甲、五行、世应、动爻、空亡、日破/月破、暗动、六合/六害、入墓等 flags。
- 已补强 `normalizeLiuyaoBoard` 和 `LiuyaoBoard.vue`，旧数组数据也会补齐纳甲五行兜底。
- 已完成本地验证：`npm run build` 通过，Function 语法检查通过；移动端浏览器提交 `/divine/qimen` 和 `/divine/liuyao` 均生成结果盘，无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 已提交并推送代码：`2d94dac feat: enrich qimen and liuyao boards`，以及小修复 `8519107 fix: format qimen horse star`。
- 已部署 Cloudflare Pages，预览地址：`https://91a66f5d.yulesuangua.pages.dev`。
- 已完成生产验收：线上 `qimen` API 返回宫位、方位、五行、八神、九星、八门、天盘干、地盘干、马星等字段；线上 `liuyao` API 返回爻位、阴阳、六亲、六神、纳甲、五行、变爻、用神建议；移动端浏览器提交 `/divine/qimen` 和 `/divine/liuyao` 均生成新结果盘，无横向溢出、无控制台错误、无 `qk_` 本地记录。
