"""
Render 启动入口
Render 会通过 PORT 环境变量指定端口，不能用硬编码 5000
"""
import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
