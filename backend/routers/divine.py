"""
算卦路由：八字、姻缘、佛学、奇门遁甲
"""
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from skill_loader import load_skill_prompt, get_skill_list
from llm_client import chat_stream, chat_invoke

router = APIRouter(prefix="/api/divine", tags=["算卦"])


# ========== 请求/响应模型 ==========

class DivineRequest(BaseModel):
    """通用算卦请求"""
    message: str                          # 用户输入
    history: Optional[list[dict]] = None  # 历史对话（多轮对话时使用）


class QimenRequest(BaseModel):
    """奇门遁甲请求（需要额外参数）"""
    message: str
    datetime_str: Optional[str] = None    # 排盘时间，如 "2024-06-15 14:30"
    city: Optional[str] = None            # 所在城市
    history: Optional[list[dict]] = None


# ========== 阴历转换 ==========

@router.get("/lunar")
def solar_to_lunar(date: str):
    """
    阳历转阴历。date 格式: YYYY-MM-DD，如 1990-05-15
    返回阴历年月日、天干地支、生肖等信息
    """
    try:
        from lunar_python import Solar
        parts = date.split("-")
        solar = Solar.fromYmd(int(parts[0]), int(parts[1]), int(parts[2]))
        lunar = solar.getLunar()

        return {
            "solar": date,
            "lunar_year": lunar.getYearInChinese(),
            "lunar_month": lunar.getMonthInChinese(),
            "lunar_day": lunar.getDayInChinese(),
            "lunar_full": f"{lunar.getYearInChinese()}年{lunar.getMonthInChinese()}月{lunar.getDayInChinese()}",
            "ganzhi_year": lunar.getYearInGanZhi(),
            "ganzhi_month": lunar.getMonthInGanZhi(),
            "ganzhi_day": lunar.getDayInGanZhi(),
            "shengxiao": lunar.getYearShengXiao(),
            "is_leap": lunar.getMonth() < 0,
        }
    except Exception as e:
        return {"error": f"日期转换失败: {str(e)}", "solar": date}


# ========== 技能列表接口 ==========

@router.get("/skills")
def list_skills():
    """获取所有可用算卦技能"""
    return {"skills": get_skill_list()}


# ========== 八字命理 ==========

@router.post("/bazi")
def divine_bazi(req: DivineRequest):
    """八字命理分析（流式）"""
    try:
        system_prompt = load_skill_prompt("bazi")
    except Exception as e:
        return {"error": f"加载八字技能失败: {str(e)}"}

    def generate():
        for text in chat_stream(system_prompt, req.message, req.history):
            yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ========== 姻缘测算 ==========

@router.post("/yinyuan")
def divine_yinyuan(req: DivineRequest):
    """姻缘测算（流式）"""
    try:
        system_prompt = load_skill_prompt("yinyuan")
    except Exception as e:
        return {"error": f"加载姻缘技能失败: {str(e)}"}

    def generate():
        for text in chat_stream(system_prompt, req.message, req.history):
            yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ========== 佛学开示 ==========

@router.post("/fojiao")
def divine_fojiao(req: DivineRequest):
    """佛学开示（流式）"""
    try:
        system_prompt = load_skill_prompt("fojiao")
    except Exception as e:
        return {"error": f"加载佛学技能失败: {str(e)}"}

    def generate():
        for text in chat_stream(system_prompt, req.message, req.history):
            yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ========== 奇门遁甲 ==========

@router.post("/qimen")
def divine_qimen(req: QimenRequest):
    """奇门遁甲排盘解盘（流式）"""
    import subprocess
    import json

    try:
        system_prompt = load_skill_prompt("qimen")
    except Exception as e:
        return {"error": f"加载奇门技能失败: {str(e)}"}

    # 如果用户提供了时间，先跑 qimen_cli.py 排盘
    chart_result = ""
    if req.datetime_str:
        try:
            script_path = str(
                __import__("pathlib").Path(__file__).parent.parent
                / "skills"
                / "Numerologist_skills-main"
                / "qimen-dunjia"
                / "scripts"
                / "qimen_cli.py"
            )
            result = subprocess.run(
                ["python", script_path, "--datetime", req.datetime_str, "--json"],
                capture_output=True,
                text=True,
                timeout=30,
            )
            if result.returncode == 0:
                chart_result = result.stdout
            else:
                chart_result = f"[排盘计算出错: {result.stderr[:200]}]"
        except Exception as e:
            chart_result = f"[排盘调用失败: {str(e)}"

    # 组装用户消息
    user_msg = req.message
    if req.city:
        user_msg = f"所在城市：{req.city}\n{user_msg}"
    if chart_result:
        user_msg = f"以下是奇门排盘结果：\n{chart_result}\n\n用户问题：{user_msg}"

    def generate():
        for text in chat_stream(system_prompt, user_msg, req.history):
            yield f"data: {text}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
