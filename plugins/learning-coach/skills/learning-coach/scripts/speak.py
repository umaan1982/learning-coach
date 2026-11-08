#!/usr/bin/env python3
"""Turn target-language text into audio for listening practice.

Uses edge-tts (natural neural voices, internet needed): `pip install edge-tts`.
Output is MP3, playable on any phone.

Commands
  say       TEXT                 -> one speaker
  dialogue  FILE                 -> lines "A: ..." / "B: ..." with two voices
                                    (exam-style conversations, Hören Teil 3)
Options
  --out PATH        output file (default: <data>/<domain>/audio/<timestamp>-<mode>.mp3)
  --domain ID       domain for the default output folder (default: german-b1)
  --lang LOCALE     voice locale (default: the domain's tts_lang, e.g. de-DE, en-US)
  --voice NAME      override the main voice (e.g. de-DE-KatjaNeural)
  --speed slow|normal|both   'both' = slow version, then normal version in one file
  --repeat N        play the whole thing N times (e.g. 2 for exam-style "twice")

Examples
  python speak.py say "Ich habe gestern mit meinem Freund gesprochen." --speed both
  python speak.py dialogue convo.txt --repeat 2
"""
import argparse
import asyncio
import datetime as dt
import re
import sys
import tempfile
from pathlib import Path

from _common import domain_dir, domain_settings

VOICES = {  # (voice A, voice B)
    "de-DE": ("de-DE-KatjaNeural", "de-DE-ConradNeural"),
    "de-AT": ("de-AT-IngridNeural", "de-AT-JonasNeural"),
    "de-CH": ("de-CH-LeniNeural", "de-CH-JanNeural"),
    "en-US": ("en-US-JennyNeural", "en-US-GuyNeural"),
}
RATE = {"slow": "-25%", "normal": "+0%"}


def need_edge_tts():
    try:
        import edge_tts  # noqa: F401
        return edge_tts
    except ImportError:
        print("edge-tts is not installed. Run: python -m pip install edge-tts", file=sys.stderr)
        sys.exit(3)


async def synth(text: str, voice: str, rate: str, path: Path):
    edge_tts = need_edge_tts()
    await edge_tts.Communicate(text, voice, rate=rate).save(str(path))


def parse_dialogue(text: str):
    turns = []
    for line in text.splitlines():
        m = re.match(r"^\s*([A-Za-z])\s*:\s*(.+)$", line)
        if m:
            turns.append((m.group(1).upper(), m.group(2).strip()))
        elif line.strip() and turns:  # continuation line
            turns[-1] = (turns[-1][0], turns[-1][1] + " " + line.strip())
    if not turns:
        raise ValueError("dialogue file needs lines like 'A: ...' and 'B: ...'")
    return turns


async def build(segments, rate_names, repeat, out: Path):
    """segments: list of (voice, text). MP3 frames from the same encoder concatenate cleanly."""
    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for rname in rate_names:
            for i, (voice, text) in enumerate(segments):
                p = Path(tmp) / f"{rname}-{i:03d}.mp3"
                await synth(text, voice, RATE[rname], p)
                parts.append(p)
        data = b"".join(p.read_bytes() for p in parts)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(data * max(1, repeat))


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("say"); s.add_argument("text")
    d = sub.add_parser("dialogue"); d.add_argument("file")
    for p in (s, d):
        p.add_argument("--out")
        p.add_argument("--domain", default="german-b1")
        p.add_argument("--lang", help="voice locale, e.g. de-DE, en-US (default: the domain's tts_lang)")
        p.add_argument("--voice")
        p.add_argument("--speed", choices=["slow", "normal", "both"], default="normal")
        p.add_argument("--repeat", type=int, default=1)
    a = ap.parse_args()

    a.lang = a.lang or domain_settings(a.domain).get("tts_lang") or "de-DE"
    if a.lang not in VOICES:
        print(f"no voices configured for {a.lang}; using de-DE", file=sys.stderr)
    va, vb = VOICES.get(a.lang, VOICES["de-DE"])
    if a.voice:
        va = a.voice
    if a.cmd == "say":
        segments = [(va, a.text)]
    else:
        turns = parse_dialogue(Path(a.file).read_text(encoding="utf-8"))
        speakers = sorted({t[0] for t in turns})
        vmap = {sp: (va if i % 2 == 0 else vb) for i, sp in enumerate(speakers)}
        segments = [(vmap[sp], txt) for sp, txt in turns]

    rates = ["slow", "normal"] if a.speed == "both" else [a.speed]
    stamp = dt.datetime.now().strftime("%Y%m%d-%H%M%S")
    out = Path(a.out) if a.out else domain_dir(a.domain) / "audio" / f"{stamp}-{a.cmd}.mp3"
    try:
        asyncio.run(build(segments, rates, a.repeat, out))
    except Exception as e:  # network or service errors
        print(f"audio generation failed: {e}", file=sys.stderr)
        return 2
    print(out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
