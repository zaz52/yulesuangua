"""
启动入口（兼容 Render / 本地 / Coze 沙箱）
- 启动前检查关键依赖是否已安装
- 使用 sys.executable 启动 uvicorn，避免 python/python3 混用问题
- Render 通过 PORT 环境变量指定端口
- 需设置以下环境变量之一来启用 AI 功能：
  - LLM_API_KEY + LLM_BASE_URL：外部 OpenAI 兼容 API（推荐 Render 使用）
  - 或依赖平台内置的 coze-coding-dev-sdk 认证（仅限 Coze 沙箱）
"""
from __future__ import annotations

import importlib.util
import os
import subprocess
import sys
from pathlib import Path


REQUIRED_MODULES = [
    "fastapi",
    "uvicorn",
    "lunar_python",
]


def find_missing_modules() -> list[str]:
    """检查关键依赖是否可导入"""
    missing: list[str] = []
    for module_name in REQUIRED_MODULES:
        if importlib.util.find_spec(module_name) is None:
            missing.append(module_name)
    # SDK 和 langchain 是可选的
    if importlib.util.find_spec("coze_coding_dev_sdk") is None:
        print("  ⚠ coze_coding_dev_sdk 未安装，SDK 模式不可用")
    if importlib.util.find_spec("langchain_openai") is None:
        print("  ⚠ langchain_openai 未安装，外部 API 模式不可用")
    return missing


def check_environment():
    """启动前检查环境和依赖"""
    print("=" * 50)
    print("乾坤之道 - 环境检查")
    print("=" * 50)

    # 依赖检查
    missing = find_missing_modules()
    if missing:
        print("❌ 启动失败：缺少以下 Python 依赖：")
        for module_name in missing:
            print(f"  - {module_name}")
        print("\n请先安装依赖：")
        print("  pip install -r requirements.txt")
        sys.exit(1)
    else:
        print("  ✅ 关键依赖检查通过")

    # 端口
    port = int(os.environ.get("PORT", 5000))
    print(f"  PORT: {port}")

    # LLM 模式
    llm_api_key = os.environ.get("LLM_API_KEY", "")
    llm_base_url = os.environ.get("LLM_BASE_URL", "")
    llm_model = os.environ.get("LLM_MODEL", "deepseek-chat")

    if llm_api_key:
        print(f"  LLM 模式: 外部 API")
        print(f"  LLM_BASE_URL: {llm_base_url or 'https://api.deepseek.com/v1'}")
        print(f"  LLM_MODEL: {llm_model}")
    else:
        print(f"  LLM 模式: 沙箱 SDK (coze-coding-dev-sdk)")
        print("  ⚠ 未设置 LLM_API_KEY，将尝试使用平台内置 SDK")

    # 技能目录
    skills_dir = Path(__file__).parent / "skills"
    if skills_dir.exists():
        skill_names = [d.name for d in skills_dir.iterdir() if d.is_dir()]
        print(f"  技能目录: {len(skill_names)} 个技能 -> {skill_names}")
    else:
        print("  ⚠ 技能目录不存在!")

    print("=" * 50)


def main() -> int:
    check_environment()
    port = int(os.environ.get("PORT", 5000))
    print(f"\n启动服务: http://0.0.0.0:{port}")
    cmd = [
        sys.executable, "-m", "uvicorn",
        "main:app",
        "--host", "0.0.0.0",
        "--port", str(port),
    ]
    return subprocess.call(cmd)


if __name__ == "__main__":
    raise SystemExit(main())
