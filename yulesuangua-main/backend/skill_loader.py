"""
技能加载器：读取 SKILL.md 和参考文档，组装成 LLM 系统提示词
"""
import os
from pathlib import Path
from typing import Optional

SKILLS_DIR = Path(__file__).parent / "skills"


def load_skill_prompt(skill_name: str) -> str:
    """
    读取指定技能的 SKILL.md 和所有参考文档，组装成完整的系统提示词。
    
    skill_name 取值: bazi, yinyuan, fojiao, qimen
    """
    skill_paths = {
        "bazi": SKILLS_DIR / "bazi-skill-main",
        "yinyuan": SKILLS_DIR / "yinyuan-skills-main",
        "fojiao": SKILLS_DIR / "Master-skill-main",
        "qimen": SKILLS_DIR / "Numerologist_skills-main" / "qimen-dunjia",
    }

    skill_dir = skill_paths.get(skill_name)
    if not skill_dir or not skill_dir.exists():
        raise ValueError(f"未知技能: {skill_name}")

    # 1. 读取 SKILL.md
    skill_md = skill_dir / "SKILL.md"
    if not skill_md.exists():
        raise FileNotFoundError(f"找不到 {skill_md}")

    prompt_parts = []
    with open(skill_md, "r", encoding="utf-8") as f:
        content = f.read()
    # 去掉 YAML front matter (--- ... ---)
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            content = content[end + 3:].strip()
    prompt_parts.append(content)

    # 2. 读取 references/ 下所有 .md 文件
    refs_dir = skill_dir / "references"
    if refs_dir.exists():
        for ref_file in sorted(refs_dir.glob("*.md")):
            with open(ref_file, "r", encoding="utf-8") as f:
                ref_content = f.read()
            prompt_parts.append(f"\n\n--- 参考文档: {ref_file.stem} ---\n\n{ref_content}")

    return "\n".join(prompt_parts)


def get_skill_list() -> list[dict]:
    """返回所有可用技能列表"""
    return [
        {
            "id": "bazi",
            "name": "四柱八字",
            "description": "通过出生时间排出四柱八字，分析命理运势",
            "icon": "☰",
        },
        {
            "id": "yinyuan",
            "name": "姻缘测算",
            "description": "八字合婚、生肖配对、紫微夫妻宫、签诗占卜",
            "icon": "💝",
        },
        {
            "id": "fojiao",
            "name": "佛学开示",
            "description": "高僧大德智慧开示，佛经典籍解读",
            "icon": "☸",
        },
        {
            "id": "qimen",
            "name": "奇门遁甲",
            "description": "时家奇门排盘、解盘、择时、方位判断",
            "icon": "☯",
        },
    ]
