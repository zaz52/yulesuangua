# yulesuangua 网站改造目标与进度

## 当前任务

把 `yulesuangua` 从旧工具站改成沉浸式玄学问事产品，并继续完善各个术法页面的结果表达。当前重点是：不同术法“算出来”的盘面不能都长成同一种卡片网格，而要按术法本身的专业表达呈现。

当前动态组件任务：在静态页面和现有状态提示组件基础上，新增一个可复用、可访问、可用于生产环境的动态 UI 边界组件，用于承载异步数据加载、空状态、错误状态、刷新/重试、竞态处理、响应式布局和插槽复用；组件必须有清晰 Props 设计、完整实现和使用示例。

当前修正任务：奇门遁甲页面必须按用户参考图呈现为真正的九宫排盘界面，包含排盘设置、顶部起局信息、九宫格、东西南北方位、每宫门/星/神/干信息和底部值符值使摘要；不能只输出文字列表或普通说明。

当前架构任务：把奇门遁甲从 `Divine.vue` 内联渲染升级为最小但可扩展的 MVP 子系统，明确系统架构、API DTO、数据库记录模型、前端领域模型和 UI 组件边界，避免后续继续退化成纯文字展示。

当前参考图扩展任务：根据用户新提供的 5 张参考图，继续把梅花易数、大六壬、灵签占问、梦境解析、宝宝起名从通用工具页升级为专属仪式界面，至少完成结构 MVP：梅花六瓣卦象盘、大六壬圆形课盘、灵签签筒/签牌结果、梦境沉浸式输入卡、起名横向大表单。

当前追加目标：接入用户提供的真实术数算法能力，使前端专业盘面优先来自算法排盘，而不是纯展示占位。

当前修正目标：统一命盘/起课时间口径，出生排盘按农历/阴历输入；结果文字不再像纯文本堆叠；起名工具改为独立候选名册 UI。

当前 UI 大修目标：根据用户 2026-07-03 上传的参考界面，把网站从旧式单列工具页改成“顶部导航 + 左侧术法栏 + 中央工作台 + 右侧指引栏”的深色国风玄学仪表盘。功能不删减、不改 API 语义，只重构布局结构、交互密度和视觉层级。

## 成功标准

- 八字结果使用接近专业命盘的四柱表格，包含年柱、月柱、日柱、时柱，以及天干、地支、藏干、十神、五行、纳音、长生、合冲刑害等行。
- 紫微斗数使用十二宫盘样式，不复用八字表。
- 奇门遁甲使用九宫盘样式。
- 奇门遁甲盘面必须像参考图一样是可视化九宫表盘：顶部显示公历/农历/局数，盘面周围显示南、东、西、北方位，九宫每宫分层展示宫位、门、星、神、天盘/地盘干，底部显示值符、值使、旬首、马星、空亡。
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
- 首页、术法页、工具页、周易起卦页都采用参考图一致的信息架构：顶部导航、左侧功能入口、中央主工作区、右侧今日指引/记录/推荐。
- 页面不再把所有功能堆在一个大屏里；每个功能继续保持独立路由，并在当前路由展示对应表单、盘面和结果。
- 参考图中的黑棕底、暗金描边、朱红主按钮、顶部会员/用户/开始问卦操作、左右侧栏卡片、中央 banner 工作台等视觉特征要稳定呈现。

## 架构思路

- 保留现有 Vue 3 + Vite 项目，不迁移 React。
- 在 `frontend/src/views/Divine.vue` 内继续保留现有表单和后端流式调用。
- `buildBoard()` 生成按 `skillId` 分流的结构化盘面数据。
- `VisualBoard` 不再渲染单一 `board-grid`，而是分发到各术法专属 renderer。
- CSS 使用当前暗色周易仪式风格，补充专业盘面类名：`bazi-pro-table`、`ziwei-palace-grid`、`qimen-nine-grid`、`liuyao-pro-lines`、`meihua-pro-grid`、`fengshui-nine-grid`、`tarot-spread`。
- `frontend/functions/api/[[path]].js` 承担 Cloudflare Pages Functions 算法接口，新增 `/api/metaphysics/calculate`。
- 前端通过 `calculateChart(skill, payload)` 调用统一排盘接口，返回数据直接映射到 `VisualBoard`。
- 起名工具继续留在独立 `/tools/qiming` 页面，不塞回首页或单一大页面。
- 新增全局 dashboard CSS 原语：`mystic-topbar`、`mystic-layout`、`left-rail`、`right-rail`、`hero-workspace`、`oracle-card`，供首页、术法页、工具页和起卦仪式复用。
- 功能实现维持 Vue 3 + Vite，不迁移 React；参考的 `build-web-apps` 插件在当前会话没有暴露可调用技能，按其网页应用设计方向手工实现。

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

### 2026-07-03 参考图仪表盘 UI 大修

- 已读取用户上传的参考图，确认目标布局为：顶部导航、左侧功能栏、中央工作台、右侧今日指引/记录/推荐栏。
- 已补充全局 dashboard 布局原语：`mystic-app`、`mystic-topbar`、`mystic-layout`、`left-rail`、`right-rail`、`hero-workspace`、`oracle-card`。
- 已将首页从旧大段 hero + 技能网格改成参考图式首页仪表盘：左侧术法菜单、中央乾坤之道 banner、今日观象、推荐功能、轻量工具入口、右侧今日卦象/宜忌/快捷入口。
- 已将 `/divine/:skill` 术法页改成参考图式工作台：左侧核心工具菜单、中央术法 banner、基础信息/排盘结果区域、右侧今日指引/最近记录/推荐功能。原表单、排盘、AI 后端调用逻辑保留。
- 已将 `/tools/:tool` 工具页改成参考图式工作台，起名页保留候选名册功能，并增加右侧指引/记录/推荐栏。
- 已将 `/zhouyi` 周易起卦页加上左侧仪式流程栏和右侧仪式进度/今日指引栏，原静心、默念、投钱、六爻、卷轴结果流程保留。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4188/` 返回 200。
  - 浏览器桌面抽查 `/`、`/divine/bazi`、`/tools/qiming`、`/zhouyi` 均能打开，核心卡片渲染正常，无页面级横向溢出。
  - 浏览器移动端 390px 抽查上述 4 个路由均能打开，无页面级横向溢出。
  - 源码扫描未发现旧 `NFY Weiyi` 页面文字、常见乱码、源码 `<pre>` 或旧“Design System”残留。

### 2026-07-03 工具布局与真实最近记录修正

- 根据用户反馈，已移除右侧栏示例“最近记录”；最近记录改为读取浏览器本地 `qk_recent_records`，没有记录时显示空状态，不再伪造“事业发展/合作项目/李姓宝宝”等记录。
- 已在 AI 问卦提交、灵签抽签、梦境解析、宝宝起名、祈福上香时写入真实本地记录，并可从右侧栏点击回到对应功能。
- 已把奇门遁甲盘面从旧九宫格渲染改成参考图方向的圆形盘式布局：外圈方位、宫位，内圈门/星/神，中心显示事件、起局时间、值符和值使；真实后端返回的 `cells + meta` 结构可继续使用。
- 已在空状态为八字、紫微、奇门、六爻、梅花、大六壬、小六壬、风水、塔罗显示对应盘面预览，用户不用提交后才看到“这个工具长什么样”。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4190/divine/qimen` 返回 200。
  - 浏览器桌面抽查 `/divine/qimen`：`.qimen-wheel` 渲染 1 个，无页面级横向溢出，无旧假记录文本。
  - 浏览器桌面抽查 `/tools/qiming`：无旧假记录文本，无页面级横向溢出。
  - 浏览器移动端 390px 抽查 `/divine/qimen` 和 `/tools/qiming`，均无页面级横向溢出。

### 2026-07-03 全术法专属盘面补齐

- 根据用户反馈“不只是奇门遁甲，其它八个也要按照上面说的来”，已把所有 AI 问卦主术法从通用格子补齐为专属盘面/版式：
  - 八字：四柱专业表。
  - 紫微：十二宫命盘。
  - 奇门：圆形盘式。
  - 六爻：本卦/变卦标题条 + 六爻线 + 世应动爻标记。
  - 梅花：本卦、互卦、变卦、体用的流程盘。
  - 大六壬：四课核心 + 初中末三传 + 神将判断区。
  - 小六壬：六宫圆盘速断。
  - 姻缘：关系缘分盘 + 关系阶段面板。
  - 合婚：双方对照 + 中央合盘 + 长期磨合说明。
  - 佛学：卷轴式请益/观照版式。
  - 风水：九宫罗盘式布局。
  - 每日运势：今日主题圆心 + 行动节奏卡。
  - 塔罗：牌阵卡牌布局。
- 已将空状态预览扩展到全部主术法页面，用户进入每个工具时就能看到该工具应有的盘面形态。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4191/divine/bazi` 返回 200。
  - 浏览器桌面抽查 13 个术法路由，每个路由均渲染对应专属选择器，且无页面级横向溢出。
  - 浏览器移动端 390px 抽查 13 个术法路由，全部无页面级横向溢出。

### 2026-07-03 参考图逐页布局继续对齐

- 用户确认需要继续按上传图片的具体布局推进，而不是只做通用三栏骨架。
- 已把首页中部补成参考图“功能中心”结构：大标题、说明文案、搜索框、分类筛选、核心问卦/命理分析/生活工具分组卡片，包含 13 个功能卡入口。
- 已把 `/divine/:skill` 单工具页补上参考图“四柱八字”类页面结构：
  - 术法横幅下方新增“查看维度”筛选胶囊。
  - 右侧栏从泛用“今日指引”改为当前工具的“填写提示”。
  - 八字、紫微、奇门、六爻等工具使用各自维度标签和填写提示。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4192/` 返回 200。
  - 浏览器桌面抽查首页：`.function-center` 1 个、`.function-card` 13 个、搜索框 1 个，无页面级横向溢出。
  - 浏览器桌面抽查 `/divine/bazi`：`.dimension-filter` 1 个、填写提示 3 条、八字盘 1 个，无页面级横向溢出。
  - 浏览器移动端 390px 抽查 `/` 和 `/divine/bazi`，均无页面级横向溢出。

### 2026-07-03 图一/图二差异修正

- 用户指出参考图和当前实现不一致，尤其紫微斗数页应是“左侧基础信息表单 + 右侧命盘示例/排盘结果”的并排结构，而当前实现把盘面放到下方，结构不对。
- 已重构 `/divine/:skill` 主工作区：
  - `primary-work-grid` 作为主内容容器。
  - 左侧保留基础信息表单，并将补充问题和开始排盘按钮合并进同一张表单卡。
  - 右侧新增 `board-preview-panel`，固定展示当前工具的盘面/命盘预览。
  - 隐藏旧的独立 `Ask` 卡，避免页面结构继续像旧版。
  - 空状态不再在下方重复展示盘面，提交后结果仍显示在下方结果区。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4193/divine/ziwei` 返回 200。
  - 浏览器桌面抽查 `/divine/ziwei`：`.primary-work-grid` 1 个、`.board-preview-panel` 1 个、`.ziwei-palace-grid` 1 个，旧 `.ask-panel` 不显示，无页面级横向溢出。
  - 浏览器移动端 390px 抽查 `/divine/ziwei`：主工作区折叠为单列，无页面级横向溢出。

### 2026-07-03 紫微表盘与输入联动修正

- 用户指出紫微斗数不能显示为文字列表，必须是表盘形式，并且要根据输入信息变化。
- 已将 `renderZiweiBoard()` 从方格宫位改为圆形十二宫表盘：
  - 外/中/内三层圆环。
  - 12 个宫位围绕中心分布。
  - 每宫显示地支、宫名、主星、辅星和大限区间。
  - 中心显示紫微斗数、命/身、五行局、命主、性别、农历生日、时辰。
- 已新增 `buildZiweiPreviewPalaces()`，预览盘会根据姓名、性别、农历生日、出生时辰生成不同宫位星曜和中心信息；不再是固定示例。
- 已把右侧预览标签从“示例”改为“实时预览”。
- 已兼容后端真实紫微数据：真实排盘返回 `palaces + meta` 时仍用同一表盘渲染。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4194/divine/ziwei` 返回 200。
  - 浏览器桌面抽查：`.ziwei-dial` 1 个、`.ziwei-dial-palace` 12 个。
  - 自动输入“李天 / 女 / 1990-05-20 / 午时”后，表盘文本发生变化，并包含输入姓名和生日。
  - 桌面和 390px 移动端均无页面级横向溢出。

## 当前剩余风险

- 风水阳宅、合婚、大六壬、每日运势等页面仍有部分是结构化展示或 AI 解读，没有完全接入专门算法盘。
- 本地 Vite 预览没有 Cloudflare Pages Functions，因此本地后端请求可能失败；线上 Cloudflare 仍通过 `/api/*` 代理到现有 Netlify API。
- Playwright 默认浏览器缓存未安装在本机默认路径，本次浏览器验证使用了系统已有 Edge。

### 2026-07-06 奇门遁甲九宫盘对齐参考图

- 根据用户指出的图一/图二差异，已将 `/divine/qimen` 的奇门遁甲盘面从旧圆形/文字式表达改为参考图方向的九宫排盘界面。
- 已补齐前端兜底盘数据：顶部公历、农历、阳遁/阴遁局数，九宫每宫的宫位、方位、神、星、门、天盘干、地盘干，以及底部值符、值使、旬首、马星、空亡。
- `renderQimenBoard()` 现在统一调用 `QimenBoard.vue`，并通过 `frontend/src/domain/qimen.js` 兼容数组形态和后端真实对象形态的 `cells/meta` 数据。
- 视觉结构已补齐：顶部起局信息条、中央方形九宫格、四方位字、暗金宫格分线、底部摘要栏和问题/方位上下文，不再只显示文字列表。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4196/divine/qimen` 返回 200。
  - 浏览器桌面抽查 `/divine/qimen`：`.qimen-grid` 1 个、`.qimen-cell` 9 个、旧 `.qimen-wheel` 0 个，无页面级横向溢出。
  - 浏览器移动端 390px 抽查 `/divine/qimen`：九宫盘仍渲染 9 宫，无页面级横向溢出。

### 2026-07-06 奇门 MVP 架构化重构

- 根据用户要求“先设计系统架构，再实现最小但可扩展 MVP”，已把奇门遁甲从 `Divine.vue` 内联实现拆成独立子系统：
  - `frontend/src/domain/qimen.js`：奇门 DTO、兜底盘、后端数组/对象数据归一化。
  - `frontend/src/components/QimenBoard.vue`：可复用九宫盘 UI，内部强制 3x3 方盘，不允许内容把盘面撑成文字列表。
  - `frontend/functions/api/[[path]].js`：`calculateQimenBoard()` 返回完整 7 字段宫位 DTO，不再压缩成 4 列文字。
  - `docs/qimen-mvp-architecture.md`：系统架构、文件结构、API、UI 架构和 MVP 验收。
  - `docs/qimen-mvp-schema.sql`：后续持久化记录表设计。
- 已在 `/divine/qimen` 主工作区为奇门页面增加 `is-qimen-work` 布局，使右侧九宫盘获得更大显示宽度。
- 已验证真实 API DTO 形态：模拟 `/api/metaphysics/calculate` 返回完整奇门数据后，结果卡仍渲染 1 个 `.qimen-grid` 和 9 个 `.qimen-cell`，并显示接口返回的“阴遁三局/测试项目”。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4198/divine/qimen` 返回 200。
  - 桌面端 `/divine/qimen`：`.qimen-grid` 1 个、`.qimen-cell` 9 个、旧 `.qimen-wheel` 0 个；九宫格尺寸 367x367，无页面级横向溢出。
  - 移动端 390px：`.qimen-grid` 1 个、`.qimen-cell` 9 个；九宫格尺寸 330x330，无页面级横向溢出。

### 2026-07-06 奇门页面三栏拥挤修正

- 根据用户反馈“最右侧不要占用这么多空间”，已对 `/divine/:skill` 术法页做局部布局覆盖，不影响首页、工具页和周易页：
  - 左侧栏从默认 224px 收到 190px。
  - 右侧栏从默认 320px 收到 230px。
  - 中间主工作区在 1440px 桌面视口下增至 952px。
  - 奇门主工作区列比例改为 `minmax(280px, 0.58fr) minmax(0, 1.42fr)`，避免右侧盘面硬撑后与右栏重叠。
- 已压缩术法页右栏视觉重量：右栏卡片 padding、标题和推荐功能按钮尺寸下调，推荐按钮改为更紧凑的两列。
- 已修复移动端回归：`.primary-work-grid.is-qimen-work` 在 980px 以下明确恢复单列，避免手机端被奇门桌面列规则压成 66px 窄列。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4201/divine/qimen` 返回 200。
  - 1440px 桌面端：左栏 190px、右栏 230px、中间主区 952px、盘面预览 656px、九宫盘 483x483，盘面与右栏无重叠，无页面级横向溢出。
  - 390px 移动端：页面单列，`.qimen-cell` 9 个，无页面级横向溢出。

### 2026-07-06 奇门表单字段重叠修正

- 根据用户截图，奇门起局信息表单中“起课时间”和“地点/方位”在窄表单卡内并排时发生重合。
- 已为事件类表单增加 `event-form-grid` 类，并在 `.primary-work-grid.is-qimen-work` 下改为单列上下布局。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4202/divine/qimen` 返回 200。
  - 浏览器测量确认“起课时间”“地点/方位”“事件类型”三个字段同列上下排列，前两个字段不重叠。
  - 桌面端无页面级横向溢出。

### 2026-07-06 五个参考工具页结构 MVP

- 根据用户新增参考图，完成 5 个页面/工具的结构级对齐：
  - `/divine/meihua`：将梅花易数结果从线性流程块改为梅花六瓣卦象盘，包含中心太极、六个花瓣卦象和底部文案。
  - `/divine/daliuren`：将大六壬结果从普通核心卡改为圆形多环课盘，包含十二支外环、神将中环、中央占时和值符值使、三传条。
  - `/tools/lingqian`：将灵签占问从普通输入 + 结果块改为抽签仪式区 + 签牌结果区。
  - `/tools/jiemeng`：将梦境解析改为沉浸式大输入框 + 描述建议胶囊 + 主按钮布局。
  - `/tools/qiming`：将宝宝起名基础信息区改为参考图方向的横向大表单布局。
- 修复 Vue scoped CSS 对 `render function` 动态节点不生效的问题：梅花和大六壬新增 `:deep()` 关键布局规则，确保盘面真正按圆盘/花瓣盘显示，不退化成普通文本块。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4204/` 可访问。
  - 桌面端 `/divine/meihua`：`.meihua-plum-board` 1 个、花瓣 6 个，盘面 430x384，无页面级横向溢出。
  - 桌面端 `/divine/daliuren`：`.daliuren-plate` 1 个，盘面 430x430，无页面级横向溢出。
  - 桌面端 `/tools/lingqian`、`/tools/jiemeng`、`/tools/qiming` 均渲染对应专属结构，无页面级横向溢出。
  - 390px 移动端抽查上述 5 个路由均无页面级横向溢出。

### 2026-07-06 生产级状态组件补强

- 根据当前任务，新增可复用状态组件 `frontend/src/components/RitualState.vue`，统一承载加载、空、错误、成功、提示和待开始状态。
- 组件 Props 设计覆盖：`variant`、`title`、`description`、`icon`、`actions`、`compact`、`bordered`、`role`、`live`、`ariaLabel`、`headingLevel`；插槽覆盖 `media`、`title`、默认正文和 `actions`。
- 可访问性决策：
  - 错误态默认 `role="alert"`，其它状态默认 `role="status"`。
  - 加载态自动设置 `aria-busy="true"`。
  - 支持 `aria-live`、自定义 heading 层级和显式 `aria-label`。
  - 尊重 `prefers-reduced-motion`，减少动画用户不会看到持续旋转。
- 已接入真实页面：
  - `/divine/:skill` 的推演加载态使用 `RitualState`。
  - AI 解读失败时保留已生成盘面，并用错误态组件展示失败原因和“清空后重试”操作。
  - `/divine/:skill` 和 `/tools/:tool` 的最近记录空状态使用 compact 状态组件，不再散落手写文案。
- 验证通过：
  - `npm run build` 成功。
  - 本地预览 `http://127.0.0.1:4195/` 返回 200。
  - 浏览器桌面抽查 `/divine/ziwei`：最近记录空状态渲染 1 个 `RitualState`，`role="status"`，无页面级横向溢出。
  - 浏览器移动端 390px 抽查 `/tools/qiming`：最近记录空状态渲染 1 个 `RitualState`，无页面级横向溢出。
  - 模拟 `/api/divine/ziwei` 返回 500：提交后先出现加载态 `aria-busy="true"`，失败后出现错误态 `role="alert"`，且紫微盘面仍保留。

### 2026-07-06 梅花易数工作台 MVP 架构化修复

- 根据用户反馈“完成样子不符合，不能只是文字表述”，本轮把 `/divine/meihua` 从旧的临时花瓣展示升级为最小但可扩展的专属排盘子系统。
- 新增 `frontend/src/domain/meihua.js`：
  - 定义梅花易数前端 DTO：`meta`、`original`、`mutual`、`changed`、`relation`、`clues`。
  - 提供 `buildMeihuaBoard()`，让起课时间、地点、事件类型和所问内容能驱动实时预览盘变化。
  - 提供 `normalizeMeihuaBoard()`，兼容后端真实算法数据和前端 fallback。
- 新增 `frontend/src/components/MeihuaBoard.vue`：
  - 使用“本卦 / 互卦 / 变卦 / 体用”的盘面结构，不再显示为普通文字卡片。
  - 中央展示体用生克，周围展示三卦，上方展示起课信息，底部展示线索摘要。
  - 支持桌面端大盘面和移动端压缩布局。
- 更新 `frontend/src/views/Divine.vue`：
  - `/divine/meihua` 主工作区使用 `is-meihua-work`，右侧盘面获得更大空间。
  - 梅花预览和提交后的结果统一使用 `MeihuaBoard`。
  - 事件表单在梅花页改为上下布局，避免字段拥挤重叠。
- 更新 `frontend/functions/api/[[path]].js`：
  - `calculateMeihuaBoard()` 返回结构化 DTO，而不是旧的 `blocks` 文本数组。
  - API 响应包含本卦、互卦、变卦、体用关系、线索和 raw 数据，方便后续持久化与复盘。
- 新增文档：
  - `docs/metaphysics-workbench-mvp.md`：系统架构、文件结构、API 接口、UI 架构和验收标准。
  - `docs/metaphysics-workbench-schema.sql`：生产环境记录表设计。
- 下一步验证要求：
  - `npm run build` 必须通过。
  - 浏览器检查 `/divine/meihua` 桌面端和 390px 移动端无横向溢出。
  - 自动修改问题内容后，梅花盘文本应发生变化。
- 验证结果：
  - `npm run build` 已通过。
  - 本地预览 `http://127.0.0.1:4210/divine/meihua` 返回 200。
  - Chrome CDP 桌面端 1440px：`.meihua-board` 1 个、`.meihua-hex` 3 个、线索 4 条、无横向溢出；修改 textarea 后盘面文本发生变化。
  - Chrome CDP 移动端 390px：`.meihua-board` 1 个、`.meihua-hex` 3 个、线索 4 条、无横向溢出。

### 2026-07-06 全核心排盘组件化 MVP

- 根据用户反馈“其它的也需要这样做，排盘要根据各个的来做”，本轮把核心排盘类术数从 `Divine.vue` 内联渲染拆成可复用组件。
- 新增统一归一化层 `frontend/src/domain/metaphysics.js`：
  - `normalizeBaziBoard`
  - `normalizeZiweiBoard`
  - `normalizeLiuyaoBoard`
  - `normalizeDaliurenBoard`
  - `normalizeXiaoliurenBoard`
  - `normalizeFengshuiBoard`
  - `normalizeTarotBoard`
- 新增专属 UI 组件：
  - `BaziBoard.vue`：四柱八字专业表格。
  - `ZiweiBoard.vue`：十二宫圆盘。
  - `LiuyaoBoard.vue`：六爻线盘。
  - `DaliurenBoard.vue`：大六壬十二支/神将/三传圆盘。
  - `XiaoliurenBoard.vue`：小六壬六宫圆盘。
  - `FengshuiBoard.vue`：九宫方位盘。
  - `TarotBoard.vue`：塔罗牌阵。
- `Divine.vue` 现在只做排盘组件分发：八字、紫微、奇门、六爻、梅花、大六壬、小六壬、风水、塔罗都使用专属组件，不再在主页面内硬编码完整盘面。
- 验证结果：
  - `npm run build` 通过。
  - 本地预览 `http://127.0.0.1:4211/divine/bazi` 返回 200。
  - Chrome CDP 桌面端 1440px 检查 9 个路由：`/divine/bazi`、`/divine/ziwei`、`/divine/qimen`、`/divine/liuyao`、`/divine/meihua`、`/divine/daliuren`、`/divine/xiaoliuren`、`/divine/fengshui`、`/divine/tarot` 均渲染对应专属组件，`.generic-pro-grid` 为 0，无横向溢出。
  - Chrome CDP 移动端 390px 检查同样 9 个路由，均渲染对应专属组件，无横向溢出。
- 剩余边界：
  - 姻缘、合婚、佛学、每日运势当前仍属于结构化结果面板，不是严格排盘；后续可以按相同模式继续拆组件。
  - 部分真实算法字段仍依赖 `mingyu-core` 返回形态，已通过归一化层做兼容 fallback。

### 2026-07-06 动态异步 UI 边界组件

- 根据用户要求“现在是静态网页，然后可以做动态的了”，新增 `frontend/src/components/AsyncBoundary.vue`，用于承载动态数据加载、空状态、错误状态、重试/刷新、竞态取消和响应式布局。
- 组件支持两种模式：
  - 非受控模式：传入 `loader`，组件内部管理 `idle/loading/success/empty/error`。
  - 受控模式：父组件传入 `status/data/error`，组件只负责渲染状态。
- 生产级细节：
  - 使用 `AbortController` 中止旧请求。
  - 使用递增 `requestId` 忽略过期响应。
  - 支持 `emptyWhen` 自定义空态和 `transform` 数据转换。
  - 支持 `header/default/loading/empty/error/idle/footer` 插槽。
  - 支持 `aria-busy`、`aria-live`、错误 `role="alert"`、heading 层级和响应式布局。
  - 复用 `RitualState`，保持现有视觉系统一致。
- 新增 `docs/async-boundary-component.md`，包含组件架构、Props 设计、完整实现位置、使用示例、边缘情况说明。
- 已接入真实页面：
  - `/divine/:skill` 右侧“最近记录”改为 `AsyncBoundary` 承载。
  - 使用 `loadRecentRecordsAsync` 作为 loader，`recentRecordsVersion` 作为刷新键。
  - 保存问卦记录后自动触发重新加载。
- 验证通过：
  - `npm run build` 成功。
  - 使用 `@vue/compiler-sfc` 对 `AsyncBoundary.vue` 做单文件编译检查通过。
  - Chrome CDP 验证 `/divine/bazi`：最近记录空态渲染 1 个 `.async-boundary`，`role="region"`、`aria-live="polite"`、无多余按钮、无横向溢出。
  - Chrome CDP 验证写入本地记录后：`.mini-record` 渲染 1 条，仍无横向溢出。
### 2026-07-06 GitHub 推送与 Cloudflare 生产部署

- 已将当前动态 UI 边界组件提交 `8f1bae0 feat: add async boundary component` 推送到 GitHub `origin/main`。
- 已执行生产构建：`npm run build` 通过，Vite 输出 `dist/index.html`、CSS 和 JS 资源。
- 因 Cloudflare Pages 项目 `yulesuangua` 未绑定 Git 自动部署，已手动执行 `wrangler pages deploy dist --project-name yulesuangua --branch main`。
- 本次部署预览地址：`https://02ac76f6.yulesuangua.pages.dev`。
- 已验证主站 `https://yulesuangua.pages.dev/` 返回 HTTP 200，预览地址同样返回 HTTP 200。
- Git 工作区验证为干净同步状态：`main...origin/main`。
### 2026-07-06 创业项目 MVP 审查与生产化目标

- 当前目标：把 `yulesuangua` 从静态展示型玄学工具站推进为一个真正可运行的创业项目 MVP，具备清晰架构、可部署 API、可持久化记录、可复用 UI、可审查文档和最小商业闭环。
- 验收标准：
  - 线上 Cloudflare Pages 不依赖已废弃的 Netlify 站点完成核心流程。
  - API 至少覆盖健康检查、技能列表、排盘计算、问卦解读、咨询记录创建、咨询记录读取和分享详情读取。
  - 没有数据库绑定时前端仍可使用本地记录兜底；绑定 Cloudflare D1 后可保存真实咨询记录。
  - 前端结果卡支持保存状态、错误状态、分享链接和最近记录刷新。
  - 文档必须包含系统架构、文件结构、数据库设计、API 接口、UI 架构和生产部署说明。
  - `npm run build` 必须通过，并用浏览器/HTTP 做端到端验证。
- 架构决策：
  - 保持 Vue 3 + Vite + Cloudflare Pages Functions，不引入新的全栈框架迁移风险。
  - 将 AI 解读先做成可替换的 `generateReading` 服务：有模型环境变量时可接真实模型，没有时返回结构化规则解读，保证 MVP 随时可用。
  - 持久化层使用 Cloudflare D1 作为生产数据库目标；API 在未绑定 `DB` 时返回明确的 `persistence_unavailable`，前端使用 localStorage 降级。

### 2026-07-06 创业项目 MVP 实现进度

- 已实现 Cloudflare Pages 自包含 API：
  - `GET /api/health`
  - `POST /api/metaphysics/calculate`
  - `POST /api/divine/:skill`
  - `POST /api/consultations`
  - `GET /api/consultations`
  - `GET /api/consultations/:id`
- 已移除核心问卦流程对旧 Netlify API 的运行时依赖；`/api/divine/:skill` 现在优先调用可选 OpenAI/NVIDIA 兼容模型环境变量，没有 Key 时返回结构化规则解读。
- 已清理旧 Netlify 站点 URL 的可见残留，Open Graph 地址改为 `https://yulesuangua.pages.dev/`。
- 已新增 D1 schema：`docs/startup-mvp-schema.sql`。
- 已新增 MVP 架构文档：`docs/startup-mvp-architecture.md`。
- 已新增分享详情页：`frontend/src/views/ShareView.vue` 和路由 `/share/:id`。
- 已在 `Divine.vue` 接入咨询记录保存；D1 未绑定时前端继续使用 localStorage 最近记录兜底。
- 已将 `/divine/:skill` 右侧最近记录改为远端 D1 优先读取，失败或未绑定数据库时自动降级到 localStorage。
- 验证结果：
  - `npm run build` 通过。
  - `node --check frontend/functions/api/[[path]].js` 通过。
  - 本地 Cloudflare Pages 运行时 `http://127.0.0.1:8788/api/health` 返回 `ok: true`。
  - `POST /api/metaphysics/calculate` 奇门排盘返回 `ok: true`。
  - `POST /api/divine/qimen` 返回 SSE 流式结构化解读。
  - `POST /api/consultations` 在未绑定 D1 时返回 `persistence_unavailable`，符合前端降级设计。
  - Edge 浏览器自动化验证 `/`、`/divine/qimen`、`/divine/bazi`、`/share/test-id` 均可打开，无页面级横向溢出。
  - 390px 移动端 `/divine/qimen` 渲染 9 个奇门宫格，无横向溢出。

### 2026-07-06 MVP 推送、部署与 D1 初始化

- 已提交并推送 MVP 基础版本：`e8a9783 feat: ship production mvp foundation`。
- 已手动部署到 Cloudflare Pages，预览地址：`https://95818e8a.yulesuangua.pages.dev`。
- 已验证主站 `https://yulesuangua.pages.dev/` 返回 HTTP 200。
- 已验证新版 `GET /api/health` 在主站返回 `runtime: cloudflare-pages-functions`。
- 已创建 Cloudflare D1 数据库 `yulesuangua-prod`，数据库 ID：`5fd04a83-9678-4aa4-ac76-281a7e8d02e1`。
- 已执行 `docs/startup-mvp-schema.sql`，创建 `consultations` 和 `product_events` 两张表及索引。
- 已新增 `frontend/wrangler.toml`，将 D1 以 `DB` 绑定给 Pages Functions。
- 已重新部署 D1 绑定版本，预览地址：`https://c6589389.yulesuangua.pages.dev`。
- 已验证主站 `GET /api/health` 返回 `database: true`。
- 已通过生产 API 完成咨询记录写入、详情读取、最近记录读取的冒烟测试，并删除测试记录。
- 已验证 `https://yulesuangua.pages.dev/divine/qimen` 和 `https://yulesuangua.pages.dev/share/test-id` 均返回 HTTP 200。
### 2026-07-06 代码库结构审查与质量重构目标

- 当前目标：在功能保持不变的前提下，按大型陌生代码库接手标准审查架构和数据流，识别结构问题、重复代码、性能瓶颈和维护风险，并完成一轮低风险质量重构。
- 重点问题：
  - `Divine.vue` 同时负责表单、排盘、流式解读、最近记录、持久化降级和渲染分发，组件职责过宽。
  - `frontend/src/api/divine.js` 重复处理健康检查、JSON 解析和 HTTP 错误，错误文案与请求细节散落。
  - Cloudflare Function 文件里仍保留旧代理注释块，容易误导后续维护。
  - 最近记录 localStorage 逻辑和远端记录映射逻辑散落在页面内部，不利于其它页面复用。
- 重构策略：
  - 抽出 `frontend/src/storage/recentRecords.js`，统一管理本地最近记录、时间格式、远端记录映射。
  - 抽出 `frontend/src/api/http.js`，统一 API base、健康检查、JSON 请求、SSE 读取和客户端 ID。
  - 保持现有 API、路由、UI 和数据结构不变，仅替换内部实现边界。
  - 删除不可达旧代理死代码，降低误用风险。

### 2026-07-06 代码质量重构进度

- 已新增 `frontend/src/api/http.js`，统一 API base、后端健康检查、JSON 请求、SSE 读取和匿名客户端 ID。
- 已重写 `frontend/src/api/divine.js` 的内部实现，保留 `fetchSkills`、`calculateChart`、`divineStream`、`createConsultationRecord` 等对外函数名不变。
- 已新增 `frontend/src/storage/recentRecords.js`，统一 localStorage 最近记录读写、时间格式化和远端咨询记录映射。
- 已将 `Divine.vue` 的最近记录逻辑替换为存储模块调用，页面组件减少本地存储细节和远端记录映射代码。
- 已将 `ToolPage.vue` 的最近记录逻辑也替换为同一存储模块，消除工具页和问卦页的重复 localStorage 读写。
- 已删除 `frontend/functions/api/[[path]].js` 中旧代理注释块，清理不可达代码。
- 验证结果：
  - `npm run build` 通过。
  - `node --check frontend/functions/api/[[path]].js` 通过。
  - 本地 Pages Functions `/api/health` 返回 `ok: true`。
  - 本地 `/api/metaphysics/calculate` 奇门排盘返回 `ok: true`。
  - Edge 自动化验证 `/`、`/divine/qimen`、`/divine/bazi`、`/share/test-id` 均可打开且无页面级横向溢出。
  - Edge 自动化验证 `/tools/qiming`、`/tools/lingqian`、`/divine/qimen` 均可打开且无页面级横向溢出。
  - 390px 移动端 `/divine/qimen` 渲染 9 个奇门宫格，无横向溢出。
  - 390px 移动端 `/tools/qiming` 无页面级横向溢出。
### 2026-07-06 NVIDIA API Key 与模型切换

- 已在 Cloudflare Pages production secrets 中配置：
  - `NVIDIA_API_KEY`
  - `NVIDIA_BASE_URL`
  - `NVIDIA_MODEL`
- 已将默认 NVIDIA 模型从旧默认值切换为 `nvidia/llama-3.3-nemotron-super-49b-v1.5`。
- 已将模型采样参数调整为 `temperature: 0.6`、`top_p: 0.95`，用于更稳的中文解读输出。
- 验证结果：
  - `npm run build` 通过。
  - `node --check frontend/functions/api/[[path]].js` 通过。
  - `wrangler pages secret list` 确认 production 环境已存在 3 个 NVIDIA secret，值为加密状态。
- 首次线上测试发现 `nvidia/llama-3.3-nemotron-super-49b-v1.5` 输出过短；`qwen/qwen3-235b-a22b` 在当前 NVIDIA 环境未成功调用。已查询 NVIDIA `/v1/models`，当前改用列表中可用的 `qwen/qwen3.5-122b-a10b` 并保留强化提示词。
- 已部署并验证 `POST /api/divine/qimen` 返回 1000+ 字符的完整中文模型解读，不再触发内置规则兜底。
- 已强化系统提示词：要求直接输出完整解读，不输出“示例”或只输出框架。

### 2026-07-07 移除最近记录与本地记录存储

- 根据用户要求，已从 `/divine/:skill` 和 `/tools/:tool` 右侧栏删除“最近记录”模块，不再展示最近记录入口或空状态。
- 已删除浏览器本地最近记录模块 `frontend/src/storage/recentRecords.js`，并移除 `qk_recent_records`、`qk_incense`、`qk_wish` 相关读写。
- 已将匿名 `clientId` 从 `localStorage` 持久化改为页面会话内存变量，避免浏览器落盘保存 `qk_` 本地记录。
- 远端 Cloudflare D1 咨询保存仍作为 best-effort 保留；前端不会再读取最近记录列表，也不会本地兜底保存记录。
- 验证结果：
  - `rg` 扫描 `frontend/src` 未发现 `localStorage`、`qk_recent_records`、`最近记录`、`recentRecords` 残留。
  - `npm run build` 通过。
  - `node --check frontend/functions/api/[[path]].js` 通过。
  - 本地 Cloudflare Pages 预览 `http://127.0.0.1:8788/` 返回 200。
  - Playwright 使用本机 Chrome 检查 `/divine/qimen`、`/tools/qiming`、`/tools/xianghuo` 的桌面端和 390px 移动端：无“最近记录”文本、无页面级横向溢出；上香交互后 `localStorage` 中没有 `qk_` key。

### 2026-07-07 隐私保护策略修正

- 用户明确说明核心目标是保护隐私，因此已将策略从“只删除最近记录和本地存储”升级为“默认不落本地、不落远端”。
- 已移除 `/divine/:skill` 正常问卦完成后的自动 D1 写入调用；AI 解读结果只存在当前页面状态里。
- 已从首页、术法页、工具页移除或改写“我的记录”“本地记录心愿”等容易误导用户的入口和文案。
- 已新增 `docs/privacy-model.md`，明确后续只有在用户主动点击“保存/分享”并看到清晰提示时，才允许调用远端保存接口。
- 验证结果：
  - `npm run build` 通过。
  - `node --check frontend/functions/api/[[path]].js` 通过。
  - Playwright 使用本机 Chrome 提交 `/divine/qimen` 后，只捕捉到 `/api/health`、`/api/metaphysics/calculate`、`/api/divine/qimen`，没有 `/api/consultations`。
  - 使用 `/divine/qimen` 和 `/tools/xianghuo` 后，`localStorage` 中没有任何 `qk_` key。

### 2026-07-07 自定义域名接入

- 已为 Cloudflare Pages 项目 `yulesuangua` 添加子域名 `suangua.weiyiai.top`。
- 已在 Cloudflare DNS 为 `suangua.weiyiai.top` 添加 CNAME，目标为 `yulesuangua.pages.dev`。
- 为了让 Pages 验证到真实 CNAME，当前 DNS 记录使用“仅 DNS”状态；如后续 Pages 域名状态完全 active，可再评估是否切回代理。
- 验证结果：
  - `nslookup suangua.weiyiai.top 1.1.1.1` 返回 `yulesuangua.pages.dev`。
  - `https://suangua.weiyiai.top/` 返回 HTTP 200。
  - `https://suangua.weiyiai.top/divine/qimen` 返回 HTTP 200。
  - Playwright 使用本机 Chrome 在 390px 移动视口检查首页和奇门页均正常渲染，无页面级横向溢出。

### 2026-07-07 网站细节巡检与隐私文案统一

- 已对线上 `https://suangua.weiyiai.top` 的首页、核心术法页、工具页和周易起卦页做桌面端与 390px 移动端巡检。
- 巡检确认：主要页面 HTTP 200，无控制台错误，无页面级横向溢出，首页、术法页、工具页和周易页均可正常渲染。
- 修复细节：
  - 工具页统一增加隐私说明：输入内容只用于当前页面生成结果，不写入本地浏览器或远端数据库。
  - 周易起卦结果页移除未实现且容易误导的“保存结果”“分享结果”按钮。
  - 周易起卦页补充“隐私保护”说明，明确不会自动保存问题或结果。
- 验证结果：
  - `npm run build` 通过。
  - `rg` 扫描 `frontend/src` 未发现 `保存结果`、`分享结果`、`我的记录`、`最近记录`、`本地记录`、`localStorage` 残留。
  - Playwright 检查 `/tools/qiming`、`/tools/jiemeng`、`/tools/xianghuo`、`/zhouyi` 的桌面端和移动端：均有隐私说明、无保存/分享空按钮、无最近记录文案、无 `qk_` 本地 key、无横向溢出。
