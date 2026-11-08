"""Shared helpers for learning-coach scripts (stdlib only)."""
import os
import re
from pathlib import Path

SKILL_DIR = Path(__file__).resolve().parent.parent


def data_root() -> Path:
    env = os.environ.get("LEARNING_COACH_DATA")
    return Path(env).expanduser() if env else Path.home() / "learning-coach-data"


def domain_dir(domain: str) -> Path:
    return data_root() / domain


def domain_settings(domain: str) -> dict:
    """Per-domain defaults from the front matter of domains/<id>/domain.md
    (tts_lang, asr_lang, asr_model, ...)."""
    return read_front_matter(SKILL_DIR / "domains" / domain / "domain.md")


def read_front_matter(path: Path) -> dict:
    """Parse simple `key: value` pairs from a YAML front-matter block."""
    if not path.exists():
        return {}
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.S)
    if not m:
        return {}
    out = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith((" ", "\t", "#")):
            k, v = line.split(":", 1)
            v = re.sub(r"\s+#(\s.*)?$", "", v)  # trailing comments `  # note` (but keep values like "#1")
            out[k.strip()] = v.strip()
    return out
