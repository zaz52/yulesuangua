# 乾坤之道 - AI 算卦网站

## 项目概览
独立算卦网站，融合四柱八字、姻缘测算、佛学开示、奇门遁甲四大玄学技能，通过 AI 大模型实现交互式解读。UI 采用赛博修仙风格（道家古风 + 科幻霓虹），背景浮游道家符文。

## 技术栈
- **前端**: Vue 3 + Vue Router 4 + Vite（赛博修仙 UI）
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
│   ├── requirements.txt   # Python 依赖
│   ├── routers/
│   │   └── divine.py      # 四个算卦 API 路由
│   └── skills/            # 开源技能源码
│       ├── bazi-skill-main/
│       ├── yinyuan-skills-main/
│       ├── Master-skill-main/
│       └── Numerologist_skills-main/
└── frontend/              # Vue 3 前端
    ├── src/
    │   ├── api/divine.js  # API 调用（流式 SSE）
    │   ├── router/index.js
    │   ├── views/
    │   │   ├── Home.vue   # 首页（太极、符文、四技能卡片）
    │   │   └── Divine.vue # 对话页（流式打字机）
    │   ├── App.vue
    │   ├── main.js
    │   └── style.css      # 赛博修仙全局样式
    └── dist/              # 构建产物
```

## API 接口
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/divine/skills | 获取技能列表 |
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
赛博修仙：道家古风 + 科幻霓虹融合
- 深空黑底 + 金色/朱砂/青色霓虹发光
- 浮游道家符文背景（道、德、玄、炁、天干地支等）
- 旋转太极 + 脉冲光环
- CRT 扫描线效果
- 书法字体（Ma Shan Zheng）+ 宋体（Noto Serif SC）
