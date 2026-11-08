#!/usr/bin/env python3
"""Offline dictation for the web UI's microphone button.

Turns a recording into text with faster-whisper, the same engine and model the skill's
pronounce.py uses (domain asr_model/asr_lang, e.g. 'small' / 'de'), so nothing extra
is downloaded. Audio decoding is borrowed from pronounce.py (webm/ogg/m4a/mp3/wav).

Usage: python transcribe.py <skill-scripts-dir> <audio-file> <domain>
Prints JSON: {"text": "...", "duration": 4.2, "language": "de"}
Exit 3 if faster-whisper isn't installed.
"""
import json
import sys


def main() -> int:
    scripts, audio_path, domain = sys.argv[1], sys.argv[2], sys.argv[3]
    sys.path.insert(0, scripts)
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("faster-whisper is not installed. Run: python -m pip install faster-whisper", file=sys.stderr)
        return 3
    from _common import domain_settings
    from pronounce import load_audio

    ds = domain_settings(domain)
    model = WhisperModel(ds.get("asr_model") or "small", device="cpu", compute_type="int8")
    audio = load_audio(audio_path)
    # vad_filter: skip silence, which otherwise makes Whisper invent text ("Untertitel …")
    segments, info = model.transcribe(audio, language=ds.get("asr_lang") or "de", beam_size=5,
                                      vad_filter=True, condition_on_previous_text=False)
    text = " ".join(s.text.strip() for s in segments).strip()
    print(json.dumps({"text": text, "duration": round(len(audio) / 16000, 1), "language": info.language}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
