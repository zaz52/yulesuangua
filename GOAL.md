# yulesuangua 网站改造目标与进度

## 当前任务

把 `yulesuangua` 从旧工具站改成沉浸式玄学问事产品，并继续完善各个术法页面的结果表达。当前重点是：不同术法“算出来”的盘面不能都长成同一种卡片网格，而要按术法本身的专业表达呈现。

当前追加目标：接入用户提供的真实术数算法能力，使前端专业盘面优先来自算法排盘，而不是纯展示占位。

当前修正目标：统一命盘/起课时间口径，出生排盘按农历/阴历输入；结果文字不再像纯文本堆叠；起名工具改为独立候选名册 UI。

## 成功标准

- 八字结果使用接近专业命盘的四柱表格，包含年柱、月柱、日柱、时柱，以及天干、地支、藏干、十神、五行、纳音、长生、合冲刑害等行。
- 紫微斗数使用十二宫盘样式，不复用八字表。
- 奇门遁甲使用九宫盘样式。
- 六爻使用六爻线、阴阳爻、世应、六亲、动爻提示。
- 梅花易数使用本卦、互卦、变卦、体用关系盘。
- 风水阳宅使用九宫方位盘。
- 塔罗使用牌阵卡牌布局。
- 其它轻量技能使用统一但不抢戏的结构化结果格。
- 点击提交后立即展示盘面，AI 后端文字解读随后补充；后端慢或失败时也不能让用户看不到盘面。
- 桌面端和移动端都能打开主要页面，没有页面级横向溢出。
- `npm run build` 必须通过；主要路由和浏览器提交验证必须通过。
- 不提交密钥，不触碰用户未要求的 Obsidian 同步。
- 八字、紫微、奇门、六爻、梅花、小六壬、塔罗优先调用 `mingyu-core` 生成真实结构化盘面。
- 算法失败或暂不支持时，前端保留当前兜底盘面，不让用户流程中断。
- 八字、紫微等出生排盘页面显示并按农历生日传参。
- 结果文字使用分段解读卡，不直接输出裸 `<pre>` 文本。
- `/tools/qiming` 使用参考图方向的候选名册样式，包含名字、拼音、寓意、补益、气质和标签。

## 架构思路

- 保留现有 Vue 3 + Vite 项目，不迁移 React。
- 在 `frontend/src/views/Divine.vue` 内继续保留现有表单和后端流式调用。
- `buildBoard()` 生成按 `skillId` 分流的结构化盘面数据。
- `VisualBoard` 不再渲染单一 `board-grid`，而是分发到各术法专属 renderer。
- CSS 使用当前暗色周易仪式风格，补充专业盘面类名：`bazi-pro-table`、`ziwei-palace-grid`、`qimen-nine-grid`、`liuyao-pro-lines`、`meihua-pro-grid`、`fengshui-nine-grid`、`tarot-spread`。
- `frontend/functions/api/[[path]].js` 承担 Cloudflare Pages Functions 算法接口，新增 `/api/metaphysics/calculate`。
- 前端通过 `calculateChart(skill, payload)` 调用统一排盘接口，返回数据直接映射到 `VisualBoard`。
- 起名工具继续留在独立 `/tools/qiming` 页面，不塞回首页或单一大页面。

## 进度记录

### 2026-07-03

- 已确认用户意图：截图里的专业大表格适合八字，但其它术法应使用各自专业盘面，而不是全部套同一张表。
- 已修改 `frontend/src/views/Divine.vue`：
  - 八字改为四柱专业表格。
  - 紫微改为十二宫盘。
  - 奇门和风水改为九宫盘。
  - 六爻改为六爻线盘。
  - 梅花改为本卦/互卦/变卦/体用盘。
  - 塔罗改为牌阵卡牌。
  - 大六壬、小六壬、姻缘、合婚、佛学、每日运势保留通用结构化盘面。
- 已修正提交时机：用户点击“提交问事”后立即插入带盘面的结果卡，AI 流式文字再更新同一张卡；后端失败时保留盘面并显示错误信息。
- 已补充响应式样式：移动端九宫/十二宫/塔罗/梅花等自动改单列或双列；八字表格限制在结果卡内部滚动，不造成整页横向溢出。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览路由 `/divine/bazi`、`/divine/ziwei`、`/divine/qimen`、`/divine/liuyao`、`/divine/meihua`、`/divine/fengshui`、`/divine/tarot` 全部返回 200。
  - 使用 Edge 浏览器提交验证后，上述 7 个术法均能显示对应专业盘面。
  - 移动端 390px 宽度抽查 `/divine/bazi`、`/divine/ziwei`、`/divine/tarot`，盘面可见且无页面级横向溢出。
  - 常见乱码和旧设计残留扫描未命中。

### 2026-07-03 真实算法接入

- 已确认 `mingyu-core@0.1.8` 是 MIT 许可证 npm 算法包，覆盖八字、紫微、奇门、六爻、梅花、小六壬、塔罗等能力。
- 已安装 `mingyu-core` 和紫微所需 peer dependency `iztro`。
- 已在 Cloudflare Pages Function 中新增 `/api/metaphysics/calculate`：
  - `bazi` 调用 `baziCalculator.calculateBazi()`。
  - `ziwei` 调用 `buildAstrolabeFromInput()`。
  - `qimen` 调用 `generateQimen()`。
  - `liuyao` 调用 `generateLiuyao()`。
  - `meihua` 调用 `generateMeihua()`。
  - `xiaoliuren` 调用 `generateXiaoliuren()`。
  - `tarot` 调用 `drawSpreadCards()`。
- 已新增前端 API `calculateChart()`，并在提交问事时优先请求真实排盘数据；失败时保留原来的兜底盘面。
- 本地接口级验证通过：八字、紫微、奇门、六爻、梅花、小六壬、塔罗均返回 `mingyu-core@0.1.8` 结构化数据。
- `npm run build` 验证通过。

### 2026-07-03 农历时间与起名 UI 修正

- 已将八字、紫微出生信息表单从“阳历生日”改为“农历生日”，并提示当前默认非闰月。
- 已将 Cloudflare Pages Function 中八字 `calculateBazi()` 改为 `isLunar: true`；紫微 `buildAstrolabeFromInput()` 改为 `dateType: 'lunar'`。
- 起课时间说明改为：用户选择现实时间，算法内部换算农历、节气、干支和时辰后排盘。
- 已修复八字高亮字段格式，避免出现 `[object Object]`。
- 已将结果区 AI 文字从裸 `<pre>` 改为 `AnswerText` 分段解读卡，避免出现截图中的纯文字堆叠。
- 已重做 `/tools/qiming`：从单段“起名方向”改为候选美称名册，包含名字、拼音、寓意、补益、气质和标签。
- 验证通过：
  - `npm run build` 成功。
  - 本地算法接口八字农历 `1996-05-01` 返回 `农历：1996年五月初一`。
  - `/tools/qiming` 浏览器验证有 6 张候选名卡，无页面级横向溢出。
  - `/divine/bazi` 移动端验证显示“农历生日”，结果区无 `<pre>`，无页面级横向溢出。
  - 扫描未发现“阳历”、旧纯文字标签、`<pre>` 或常见乱码残留。

## 当前剩余风险

- 风水阳宅、合婚、大六壬、每日运势等页面仍有部分是结构化展示或 AI 解读，没有完全接入专门算法盘。
- 本地 Vite 预览没有 Cloudflare Pages Functions，因此本地后端请求可能失败；线上 Cloudflare 仍通过 `/api/*` 代理到现有 Netlify API。
- Playwright 默认浏览器缓存未安装在本机默认路径，本次浏览器验证使用了系统已有 Edge。
