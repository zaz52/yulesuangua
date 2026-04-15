"""
LLM 调用模块：使用 coze-coding-dev-sdk 调用大模型
"""
from typing import Iterator
from coze_coding_dev_sdk import LLMClient
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage


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


def chat_stream(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str = "doubao-seed-1-8-251228",
    temperature: float = 0.8,
) -> Iterator[str]:
    """
    流式调用 LLM，逐字返回结果。

    参数:
        system_prompt: 系统提示词（技能提示词 + 参考文档）
        user_message: 用户输入的消息
        history: 历史对话 [{"role": "user"/"assistant", "content": "..."}]
        model: 模型 ID
        temperature: 随机性 (0-2)
    """
    client = LLMClient()

    messages = [SystemMessage(content=system_prompt)]

    # 加入历史对话
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


def chat_invoke(
    system_prompt: str,
    user_message: str,
    history: list[dict] | None = None,
    model: str = "doubao-seed-1-8-251228",
    temperature: float = 0.8,
) -> str:
    """
    非流式调用 LLM，一次性返回完整结果。
    """
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
