# 乾坤之道 - AI 算卦网站

## 项目概览
独立算卦网站，融合四柱八字、姻缘测算、佛学开示、奇门遁甲四大玄学技能，通过 AI 大模型实现交互式解读。UI 采用古风水墨风格（宣纸底色 + 水墨符文 + 书法字体）。

## 技术栈
- **前端**: Vue 3 + Vue Router 4 + Vite（古风水墨 UI）
- **后端**: Python FastAPI
- **AI**: coze-coding-dev-sdk（豆包/DeepSeek 等大模型）
- **奇门排盘**: lunar_python + qimen_cli.py

## 项目结构
```
/workspace/projects/
├── .coze                  # 项目构建/运行配置
├── AGENTS.md              # 项目文档
├── backend/               # Python 后端
│   ├── main.py            # FastAPI 入口，托管前端静态文件
│   ├── llm_client.py      # LLM 调用模块（流式/非流式）
│   ├── skill_loader.py    # 技能加载器（读取 SKILL.md + references）
│   ├── routers/
│   │   └── divine.py      # 五个算卦 API 路由（含阴历转换）
│   └── skills/            # 开源技能源码
│       ├── bazi-skill-main/
│       ├── yinyuan-skills-main/
│       ├── Master-skill-main/
│       └── Numerologist_skills-main/
└── frontend/              # Vue 3 前端
    ├── src/
    │   ├── api/divine.js  # API 调用（流式 SSE + 换行反转义）
    │   ├── router/index.js
    │   ├── views/
    │   │   ├── Home.vue   # 首页（太极、符文、四技能卡片）
    │   │   └── Divine.vue # 对话页（沉浸式卷轴 + 阴历转换）
    │   ├── App.vue
    │   ├── main.js
    │   └── style.css      # 古风水墨全局样式
    └── dist/              # 构建产物
```

## API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/divine/skills | 获取技能列表 |
| GET | /api/divine/lunar?date=YYYY-MM-DD | 阳历转阴历 |
| POST | /api/divine/bazi | 八字命理（流式 SSE） |
| POST | /api/divine/yinyuan | 姻缘测算（流式 SSE） |
| POST | /api/divine/fojiao | 佛学开示（流式 SSE） |
| POST | /api/divine/qimen | 奇门遁甲（流式 SSE） |

## 构建与运行
```bash
# 前端构建
cd frontend && pnpm install && pnpm build

# 后端启动（端口 5000）
cd backend && python3 -m uvicorn main:app --port 5000 --host 0.0.0.0
```

## UI 风格
古风水墨：宣纸底色 + 水墨符文 + 书法字体
- 宣纸米色底色（#f7f2e8）+ 墨色文字（#2c2c2c）
- 浮游道家符文背景（道、德、玄、炁、天干地支等）
- 旋转太极图标
- 书法字体（Ma Shan Zheng）+ 宋体（Noto Serif SC）
- 四色体系：靛蓝（八字）、朱砂（姻缘）、古金（佛学）、青瓷（奇门）
- 八字页面自动阳历→阴历转换 + 时辰默认当前
- 奇门页面默认当前时间排盘

## 关键技术细节
- **SSE 换行处理**: 后端 `divine.py` 中 `\n` → `\\n` 转义，前端 `divine.js` 中反转义，确保 AI 回复的段落换行正确显示
- **路由优先级**: `main.py` 中间件确保 `/api` 请求不被前端静态文件托管拦截
- **Python 依赖**: 使用系统 Python 3.12，全局安装依赖（避免虚拟环境路径问题）
