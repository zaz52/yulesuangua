from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="乾坤之道 API", version="1.0.0")

# 允许前端访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "乾坤之道 API 服务正常运行"}

@app.get("/api/health")
def health():
    return {"status": "ok"}
