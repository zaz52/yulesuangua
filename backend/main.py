import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from routers.divine import router as divine_router

app = FastAPI(title="乾坤之道 API", version="1.0.0")

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册算卦路由（必须在前面，优先匹配 /api/ 路径）
app.include_router(divine_router)


@app.get("/api/health")
def health():
    from llm_client import get_mode
    return {"status": "ok", "llm_mode": get_mode()}


# ===== 托管前端静态文件 =====
FRONTEND_DIST = Path(__file__).parent.parent / "frontend" / "dist"

if FRONTEND_DIST.exists():
    # 挂载静态资源目录
    app.mount("/static_assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="static_assets")

    @app.middleware("http")
    async def frontend_fallback(request: Request, call_next):
        """非 /api 请求回退到前端 index.html"""
        response = await call_next(request)
        # 如果 API 路由已匹配，直接返回
        if request.url.path.startswith("/api"):
            return response
        # 如果静态资源已找到，直接返回
        if response.status_code != 404:
            return response
        # 否则返回前端 index.html
        return FileResponse(FRONTEND_DIST / "index.html")

    # 静态资源直接服务
    @app.get("/assets/{file_path:path}")
    async def serve_assets(file_path: str):
        full = FRONTEND_DIST / "assets" / file_path
        if full.exists() and full.is_file():
            return FileResponse(full)
        return FileResponse(FRONTEND_DIST / "index.html")

    # 根路径
    @app.get("/")
    async def serve_index():
        return FileResponse(FRONTEND_DIST / "index.html")

    # 其他非API路径
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = FRONTEND_DIST / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(FRONTEND_DIST / "index.html")
else:
    @app.get("/")
    def root():
        return {
            "message": "乾坤之道 API 正在运行",
            "hint": "前端未构建，请先 cd frontend && pnpm build",
        }
