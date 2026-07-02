# 全站周易仪式化重构目标

## 任务

将现有 `yulesuangua` 网站的旧 UI 推翻重做，不做独立项目，不在原页面上小修小补。保留现有 Vue 3 + Vite、路由、Netlify Functions 后端契约，把首页、AI 占问页、独立工具页、周易起卦页统一重构为“东方玄学 + 周易文化 + 古风仪式感 + 复古科技感”的沉浸式产品。

## 成功标准

- 首页不再堆满所有功能，而是作为清晰入口，突出“周易起卦”和四类 AI 问事。
- `/zhouyi` 与 `/tools/liuyao` 是完整动态起卦流程：静心、默念、准备、投掷、六爻、定格、解卦。
- `/divine/:skill` 保留后端 API 调用，界面改为统一的暗色仪式工作台，表单、盘面、结果都可读。
- `/tools/:tool` 每个工具有独立页面和可交互内容，不再依赖首页堆叠。
- 全局样式使用统一 design tokens：墨黑、深棕、暗金、朱红、宣纸白、青铜、烟雾、粒子、卷轴、印章按钮。
- 桌面端与移动端都可用，不出现明显遮挡、横向溢出、乱码或旧 demo 内容。
- `npm run build` 通过，主要路由本地预览返回 200。
- 不读取 C 盘文件，不同步 Obsidian，除非用户明确说“同步”。

## 架构思路

- 继续使用 Vue 3 + Vite，避免把现有项目迁成独立 React 项目。
- 用 `frontend/src/style.css` 承担全局主题、材质、按钮、卡片、表单、动效基础。
- 各页面保留业务逻辑但重写布局和文案：
  - `Home.vue`：沉浸入口、核心问事、独立工具、理性边界。
  - `Divine.vue`：方法侧栏、信息表单、视觉盘面、流式结果。
  - `ToolPage.vue`：黄历、灵签、解梦、起名、香火等独立交互。
  - `ZhouyiRitual.vue`：完整周易起卦仪式。
- 后端 API 不改动：继续调用 `/api/health`、`/api/divine/:skill`、`/api/divine/lunar`。

## 进度记录

### 2026-07-02

- 确认用户最新意图：不是在原 UI 基础上修改，而是全站推翻重做。
- 确认当前主要页面存在乱码和旧浅色设计系统残留，需要直接重写。
- 约束确认：不触碰 C 盘 PDF，不进行 Obsidian 同步，工作继续保持在 E 盘仓库内。
- 已重写 `frontend/src/style.css`，把旧浅色设计系统替换为暗色周易仪式主题，并统一卡片、按钮、表单、徽章、烟雾粒子和六爻线条基础样式。
- 已重写 `frontend/index.html` 与 `frontend/src/api/divine.js`，恢复正常中文 SEO 文案、标题、favicon 和后端不可用提示。
- 已重写 `Home.vue`，首页变为沉浸式门户，第一屏突出“静心起卦，观象问事”，并将 AI 问事和独立工具拆成清晰入口。
- 已重写 `Divine.vue`，保留后端流式 API 调用，改成暗色仪式工作台，包含方法侧栏、项目信息表单、视觉盘面和结果区。
- 已重写 `ToolPage.vue`，黄历、灵签、解梦、起名、香火均有独立交互；六爻继续由 `/tools/liuyao` 路由进入完整周易起卦。
- 已重写 `ZhouyiRitual.vue`，实现静心引导、默念问题、起卦准备、铜钱投掷、六爻生成、卦象定格、卷轴解卦的完整流程。
- 验证：`npm run build` 已通过，构建产物生成成功。
- 验证：本地预览 `http://127.0.0.1:4196` 下 `/`、`/zhouyi`、`/tools/huangli`、`/tools/lingqian`、`/tools/jiemeng`、`/tools/qiming`、`/tools/xianghuo`、`/tools/liuyao`、`/divine/bazi`、`/divine/qimen` 均返回 HTTP 200。
- 验证：扫描 `frontend/src`、`frontend/index.html`、`frontend/dist`，未发现常见乱码片段或旧设计系统 demo 文案。
- 验证：`git diff --check` 通过，仅有 Windows 换行提示。
- 限制：Playwright 包可用，但浏览器二进制缺失；按“不碰 C 盘”约束，尝试把 Chromium 下载到 `E:\ms-playwright`，120 秒内未完成，因此未执行截图级浏览器验证。
