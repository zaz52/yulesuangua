# 乾坤之道 · AI 算卦网站

融合四柱八字、姻缘测算、佛学开示、奇门遁甲四大玄学技能，通过 AI 大模型实现交互式解读。

## 预览

![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.x-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)

古风水墨风格 UI：宣纸底色 + 水墨符文 + 书法字体，浮游道家符文背景，沉浸式卷轴体验。

## 功能

| 技能 | 说明 | 特色 |
|------|------|------|
| 四柱八字 | 排出四柱八字，分析命理运势 | 阳历自动转阴历，时辰默认当前 |
| 姻缘测算 | 八字合婚、生肖配对、签诗占卜 | 桃花运势、紫微夫妻宫 |
| 佛学开示 | 高僧大德智慧开示 | 佛经典籍解读 |
| 奇门遁甲 | 时家奇门排盘、解盘、择时 | 默认当前时间排盘，方位判断 |

**通用特性：**
- AI 流式打字机式回复（SSE）
- 浮游道家符文背景动画
- 阳历↔阴历自动转换
- 移动端响应式适配

## 技术栈

- **前端**：Vue 3 + Vue Router 4 + Vite
- **后端**：Python FastAPI
- **AI**：coze-coding-dev-sdk（豆包/DeepSeek 大模型，流式输出）
- **排盘**：lunar_python + qimen_cli.py
- **字体**：Ma Shan Zheng（书法）+ Noto Serif SC（宋体）

## 项目结构

```
├── backend/               # Python 后端
│   ├── main.py            # FastAPI 入口，托管前端静态文件
│   ├── llm_client.py      # LLM 调用模块（流式/非流式）
│   ├── skill_loader.py    # 技能加载器（读取 SKILL.md + references）
│   ├── routers/
│   │   └── divine.py      # 算卦 API 路由（含阴历转换）
│   └── skills/            # 开源技能源码
│       ├── bazi-skill-main/
│       ├── yinyuan-skills-main/
│       ├── Master-skill-main/
│       └── Numerologist_skills-main/
├── frontend/              # Vue 3 前端
│   ├── src/
│   │   ├── api/divine.js  # API 调用（流式 SSE + 换行反转义）
│   │   ├── router/index.js
│   │   ├── views/
│   │   │   ├── Home.vue   # 首页（太极、符文、四技能卡片）
│   │   │   └── Divine.vue # 对话页（沉浸式卷轴 + 阴历转换）
│   │   ├── App.vue
│   │   ├── main.js
│   │   └── style.css      # 古风水墨全局样式
│   └── dist/              # 构建产物
├── .coze                  # 项目构建/运行配置
└── AGENTS.md              # 项目文档
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/divine/skills` | 获取技能列表 |
| GET | `/api/divine/lunar?date=YYYY-MM-DD` | 阳历转阴历 |
| POST | `/api/divine/bazi` | 八字命理（流式 SSE） |
| POST | `/api/divine/yinyuan` | 姻缘测算（流式 SSE） |
| POST | `/api/divine/fojiao` | 佛学开示（流式 SSE） |
| POST | `/api/divine/qimen` | 奇门遁甲（流式 SSE） |

### 请求示例

**八字命理**
```json
POST /api/divine/bazi
{
  "message": "姓名：张三，性别：男，阳历生日：1990-05-15，时辰：午时",
  "history": []
}
```

**奇门遁甲**（支持排盘参数）
```json
POST /api/divine/qimen
{
  "message": "今天适合出行吗？",
  "datetime_str": "2024-06-15 14:30",
  "city": "北京"
}
```

**阳历转阴历**
```
GET /api/divine/lunar?date=1990-05-15
→ { "lunar_full": "一九九〇年四月廿一", "ganzhi_year": "庚午", "shengxiao": "马" }
```

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.12+
- pnpm

### 安装依赖

```bash
# 前端
cd frontend && pnpm install

# 后端（推荐）
python3 -m pip install -r backend/requirements.txt
```

### 本地运行

```bash
# 1. 构建前端
cd frontend && pnpm build

# 2. 启动后端（端口 5000）
# 方式 A（推荐）：带依赖自检
python3 backend/run.py

# 方式 B（传统）
cd backend && python3 -m uvicorn main:app --port 5000 --host 0.0.0.0
```

访问 http://localhost:5000 即可使用。

### 开发模式

```bash
# 前端热更新（端口 5173）
cd frontend && pnpm dev

# 后端
cd backend && python3 -m uvicorn main:app --port 5000 --reload
```

## Git 内自动更新（可选）

如果你希望“在 Git 里操作时自动 push”，推荐使用仓库内置的 `post-commit` Hook 模板：**只有提交信息包含 `[push]` 才会自动推送**，避免每次 commit 都触发 push。

### 安装 Hook

```bash
bash scripts/setup-git-hooks.sh
```

### 触发自动推送

```bash
git add -A
git commit -m "feat: 更新首页文案 [push]"
```

提交完成后，Hook 会自动执行 `git push origin <当前分支>`。

### 可选环境变量

- `AUTO_PUSH_REMOTE`：默认 `origin`
- `AUTO_PUSH_BRANCH`：默认“当前分支”

示例（固定推送到 `work`）：

```bash
AUTO_PUSH_BRANCH=work git commit -m "chore: 同步配置 [push]"
```

## UI 设计

古风水墨风格，四色体系对应四大技能：

| 技能 | 主色 | 色值 |
|------|------|------|
| 四柱八字 | 靛蓝 | `#3a6b8c` |
| 姻缘测算 | 朱砂 | `#c0392b` |
| 佛学开示 | 古金 | `#b8860b` |
| 奇门遁甲 | 青瓷 | `#2e7d5b` |

## 免责声明

本项目仅供娱乐参考，不作为任何决策依据。道法自然，顺应天时。
