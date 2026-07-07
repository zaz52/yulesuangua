# yulesuangua 当前目标与进度

## 当前任务

继续把网站从“静态玄学工具展示”推进到“可真实运行的产品 MVP”。本阶段优先完成宝宝起名工具的动态化：用户填写姓氏、性别、农历生日、时辰和偏好后，页面先调用现有 `/api/metaphysics/calculate` 八字排盘接口，再根据八字五行结构生成候选名册。

## 成功标准

- `/tools/qiming` 不再只是固定候选名文本，而是根据输入的姓氏、性别、农历生日、出生时辰和偏好变化。
- 起名结果必须展示八字/五行依据：日主、农历信息、格局/用神、五行补益方向。
- 页面具备加载状态、错误状态、兜底状态、空状态和可访问的状态提示。
- 不写入 `localStorage`，不自动保存到 D1，不调用 `/api/consultations`。
- `npm run build` 通过，Cloudflare Function 语法检查通过。
- 使用浏览器验证 `/tools/qiming` 桌面端和移动端可用、无横向溢出、无控制台错误、无 `qk_` 本地记录。
- 验证后推送到 GitHub，并部署到 Cloudflare Pages，生产域名可打开。

## 架构思路

- 保留现有 Vue 3 + Vite + Cloudflare Pages Functions 架构。
- 前端 `ToolPage.vue` 的起名工具调用已有 `calculateChart('bazi', { profile })`，复用后端八字排盘能力，避免新增隐私存储链路。
- 起名候选生成保持前端本页规则 MVP：根据八字 highlights/rows 提取五行倾向、日主、用神，再映射到候选字库和标签。
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
- 下一步：继续把黄历/每日运势接入真实黄历与节气数据，或把周易 64 卦经典文本补全。
