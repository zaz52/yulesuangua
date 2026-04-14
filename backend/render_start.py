"""
Render 启动入口
- Render 通过 PORT 环境变量指定端口
- 需设置以下环境变量之一来启用 AI 功能：
  - LLM_API_KEY + LLM_BASE_URL：外部 OpenAI 兼容 API（推荐 Render 使用）
  - 或依赖平台内置的 coze-coding-dev-sdk 认证（仅限 Coze 沙箱）
"""
import os
import sys
import uvicorn


def check_environment():
    """启动前检查关键环境变量"""
    print("=" * 50)
    print("乾坤之道 - 环境检查")
    print("=" * 50)

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
    from pathlib import Path
    skills_dir = Path(__file__).parent / "skills"
    if skills_dir.exists():
        skill_names = [d.name for d in skills_dir.iterdir() if d.is_dir()]
        print(f"  技能目录: {len(skill_names)} 个技能 -> {skill_names}")
    else:
        print("  ⚠ 技能目录不存在!")

    print("=" * 50)


if __name__ == "__main__":
    check_environment()
    port = int(os.environ.get("PORT", 5000))
    print(f"\n启动服务: http://0.0.0.0:{port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port)
