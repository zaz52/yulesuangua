"""
LLM 调用模块：双模式支持
  - 沙箱模式（默认）：使用 coze-coding-dev-sdk，自动从平台环境变量获取认证
  - 外部部署模式：通过 LLM_API_KEY + LLM_BASE_URL 环境变量配置 OpenAI 兼容 API

环境变量说明：
  LLM_API_KEY  - 外部部署时的 API Key（如 OpenAI/DeepSeek 的 Key）
  LLM_BASE_URL - 外部部署时的 API 基地址（如 https://api.deepseek.com/v1）
  LLM_MODEL    - 外部部署时的模型名（默认 deepseek-chat）
"""
import os
from typing import Iterator

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

# 检测运行模式：有 LLM_API_KEY 则走外部部署模式，否则走沙箱 SDK 模式
_USE_EXTERNAL = bool(os.environ.get("LLM_API_KEY"))


def get_text_content(content) -> str:
    """安全地从 LLM 响应中提取文本内容"""
    if isinstance(content, str):
        return content
    elif isinstance(content, list):
        if content and isinstance(content[0], str):
            return " ".join(content)
        else:
            return " ".join(
                item.get("text", "")
                for item in content
                if isinstance(item, dict) and item.get("type") == "text"
            )
    return str(content)


# ==================== 外部部署模式 ====================

def _get_external_client():
    """获取外部部署的 ChatOpenAI 客户端"""
    from langchain_openai import ChatOpenAI
    api_key = os.environ.get("LLM_API_KEY", "")
    base_url = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com/v1")
    model = os.environ.get("LLM_MODEL", "deepseek-chat")
    return ChatOpenAI(
        api_key=api_key,
        base_url=base_url,
        model=model,
        streaming=True,
        temperature=0.8,
        max_tokens=4096,
    )


def _external_stream(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str | None = None,
    temperature: float = 0.8,
) -> Iterator[str]:
    """外部部署模式：使用 ChatOpenAI 流式输出"""
    client = _get_external_client()
    # 如果传了不同的模型/温度，重新创建客户端
    override_model = model or os.environ.get("LLM_MODEL", "deepseek-chat")
    if override_model != os.environ.get("LLM_MODEL", "deepseek-chat") or temperature != 0.8:
        from langchain_openai import ChatOpenAI
        client = ChatOpenAI(
            api_key=os.environ.get("LLM_API_KEY", ""),
            base_url=os.environ.get("LLM_BASE_URL", "https://api.deepseek.com/v1"),
            model=override_model,
            streaming=True,
            temperature=temperature,
            max_tokens=4096,
        )

    messages = [SystemMessage(content=system_prompt)]
    if history:
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=user_message))

    for chunk in client.stream(messages):
        if chunk.content:
            yield chunk.content


def _external_invoke(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str | None = None,
    temperature: float = 0.8,
) -> str:
    """外部部署模式：使用 ChatOpenAI 非流式调用"""
    from langchain_openai import ChatOpenAI
    api_key = os.environ.get("LLM_API_KEY", "")
    base_url = os.environ.get("LLM_BASE_URL", "https://api.deepseek.com/v1")
    override_model = model or os.environ.get("LLM_MODEL", "deepseek-chat")

    client = ChatOpenAI(
        api_key=api_key,
        base_url=base_url,
        model=override_model,
        streaming=False,
        temperature=temperature,
        max_tokens=4096,
    )

    messages = [SystemMessage(content=system_prompt)]
    if history:
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
    messages.append(HumanMessage(content=user_message))

    response = client.invoke(messages)
    return get_text_content(response.content)


# ==================== 沙箱 SDK 模式 ====================

def _sdk_stream(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str = "doubao-seed-1-8-251228",
    temperature: float = 0.8,
) -> Iterator[str]:
    """沙箱模式：使用 coze-coding-dev-sdk 流式输出"""
    from coze_coding_dev_sdk import LLMClient

    client = LLMClient()
    messages = [SystemMessage(content=system_prompt)]

    if history:
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=user_message))

    for chunk in client.stream(
        messages=messages,
        model=model,
        temperature=temperature,
        thinking="disabled",
    ):
        if chunk.content:
            text = get_text_content(chunk.content)
            if text:
                yield text


def _sdk_invoke(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str = "doubao-seed-1-8-251228",
    temperature: float = 0.8,
) -> str:
    """沙箱模式：使用 coze-coding-dev-sdk 非流式调用"""
    from coze_coding_dev_sdk import LLMClient

    client = LLMClient()
    messages = [SystemMessage(content=system_prompt)]

    if history:
        for msg in history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))

    messages.append(HumanMessage(content=user_message))

    response = client.invoke(
        messages=messages,
        model=model,
        temperature=temperature,
        thinking="disabled",
    )

    return get_text_content(response.content)


# ==================== 统一入口 ====================

def chat_stream(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str = "doubao-seed-1-8-251228",
    temperature: float = 0.8,
) -> Iterator[str]:
    """
    流式调用 LLM，逐字返回结果。自动检测运行模式。

    参数:
        system_prompt: 系统提示词（技能提示词 + 参考文档）
        user_message: 用户输入的消息
        history: 历史对话 [{"role": "user"/"assistant", "content": "..."}]
        model: 模型 ID（沙箱模式下使用 SDK 模型名，外部模式下被 LLM_MODEL 覆盖）
        temperature: 随机性 (0-2)
    """
    if _USE_EXTERNAL:
        yield from _external_stream(system_prompt, user_message, history, model, temperature)
    else:
        yield from _sdk_stream(system_prompt, user_message, history, model, temperature)


def chat_invoke(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str = "doubao-seed-1-8-251228",
    temperature: float = 0.8,
) -> str:
    """
    非流式调用 LLM，一次性返回完整结果。自动检测运行模式。
    """
    if _USE_EXTERNAL:
        return _external_invoke(system_prompt, user_message, history, model, temperature)
    else:
        return _sdk_invoke(system_prompt, user_message, history, model, temperature)


def get_mode() -> str:
    """返回当前 LLM 模式：'external' 或 'sdk'"""
    return "external" if _USE_EXTERNAL else "sdk"
