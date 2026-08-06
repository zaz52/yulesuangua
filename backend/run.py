"""
本地启动入口：
- 启动前检查关键依赖是否已安装
- 使用当前 Python 解释器启动 uvicorn，避免 python/python3 混用问题
"""
from __future__ import annotations

import importlib.util
import os
import subprocess
import sys


REQUIRED_MODULES = [
    "fastapi",
    "uvicorn",
    "coze_coding_dev_sdk",
    "langchain_core",
    "lunar_python",
]


def find_missing_modules() -> list[str]:
    missing: list[str] = []
    for module_name in REQUIRED_MODULES:
        if importlib.util.find_spec(module_name) is None:
            missing.append(module_name)
    return missing


def main() -> int:
    missing = find_missing_modules()
    if missing:
        print("❌ 启动失败：缺少以下 Python 依赖：")
        for module_name in missing:
            print(f"  - {module_name}")
        print("\n请先安装依赖：")
        print("  python3 -m pip install -r backend/requirements.txt")
        return 1

    port = int(os.environ.get("PORT", "5000"))
    cmd = [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", str(port)]
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
