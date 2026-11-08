#!/usr/bin/env python3
"""Score a spoken recording against the sentence the learner meant to say.

Runs offline speech recognition (faster-whisper; `pip install faster-whisper`;
the model downloads once, ~460 MB for 'small') and compares what it heard with
the target sentence, word by word.

Usage
  python pronounce.py --audio rec.m4a --target "Das Wetter war schön." [--model small] [--lang de] [--json]

Reports
  intelligibility  % of target words recognised clearly (the ASR heard them, confidence >= 0.6)
  per word         ok / unclear (heard but low confidence) / misheard as X / missing
  fluency          speech rate (words per minute), pauses > 0.4 s, longest pause

This is an intelligibility proxy (what a recogniser understood), not a phoneme-level
pronunciation grade. Recognisers also make their own mistakes, so treat single
flags as hints and act on patterns that repeat.
"""
import argparse
import difflib
import json
import re
import sys

CLEAR = 0.6   # word probability above which a word counts as clearly heard
PAUSE = 0.4   # seconds of silence between words that counts as a pause


def norm(text):
    return [w for w in re.sub(r"[^\wäöüß'-]+", " ", text.lower()).split() if w]


def load_audio(path, rate=16000):
    """Decode any audio file (mp3/m4a/ogg/wav/webm) to mono float32 at 16 kHz.
    Done here (not by faster-whisper) so it works with any PyAV version."""
    import av
    import numpy as np
    chunks = []
    with av.open(path) as container:
        resampler = av.AudioResampler(format="s16", layout="mono", rate=rate)
        for frame in container.decode(audio=0):
            for out in resampler.resample(frame):
                chunks.append(out.to_ndarray().reshape(-1))
        for out in resampler.resample(None):  # flush
            chunks.append(out.to_ndarray().reshape(-1))
    if not chunks:
        raise ValueError(f"no audio found in {path}")
    return np.concatenate(chunks).astype(np.float32) / 32768.0


def transcribe(path, model_size, lang):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("faster-whisper is not installed. Run: python -m pip install faster-whisper", file=sys.stderr)
        sys.exit(3)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    audio = load_audio(path)
    segments, _ = model.transcribe(audio, language=lang, word_timestamps=True, beam_size=5,
                                   vad_filter=False, condition_on_previous_text=False)
    words = []
    for seg in segments:
        for w in seg.words or []:
            for tok in norm(w.word):
                words.append({"w": tok, "p": float(w.probability), "start": float(w.start), "end": float(w.end)})
    return words, audio


def compare(target_text, heard):
    target = norm(target_text)
    hw = [h["w"] for h in heard]
    sm = difflib.SequenceMatcher(a=target, b=hw, autojunk=False)
    report, extra = [], []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == "equal":
            for k in range(i2 - i1):
                h = heard[j1 + k]
                report.append({"word": target[i1 + k], "status": "ok" if h["p"] >= CLEAR else "unclear", "p": round(h["p"], 2)})
        elif op == "replace":
            heard_txt = " ".join(hw[j1:j2])
            for k in range(i1, i2):
                report.append({"word": target[k], "status": "misheard", "heard": heard_txt})
        elif op == "delete":
            for k in range(i1, i2):
                report.append({"word": target[k], "status": "missing"})
        elif op == "insert":
            extra.extend(hw[j1:j2])
    return report, extra


def silences(audio, rate=16000, frame=0.02):
    """Silent stretches (seconds) between the first and last speech frame, from signal energy.
    Whisper's word timestamps tend to swallow pauses, so measure them from the audio itself."""
    import numpy as np
    n = int(rate * frame)
    frames = audio[: len(audio) // n * n].reshape(-1, n)
    rms = np.sqrt((frames ** 2).mean(axis=1) + 1e-12)
    loud = rms[rms > 0]
    thresh = max(0.01, 0.1 * float(np.percentile(loud, 90))) if len(loud) else 0.01
    speech = rms > thresh
    idx = np.flatnonzero(speech)
    if len(idx) < 2:
        return [], 0.0
    runs, cur = [], 0
    for s in speech[idx[0]: idx[-1] + 1]:
        if s:
            if cur:
                runs.append(cur * frame)
            cur = 0
        else:
            cur += 1
    return [r for r in runs if r > PAUSE], (idx[-1] - idx[0] + 1) * frame


def fluency(heard, audio):
    if len(heard) < 2:
        return {"wpm": None, "pauses": 0, "longest_pause": 0.0, "duration": 0.0}
    pauses, dur = silences(audio)
    return {"wpm": round(len(heard) / dur * 60) if dur > 0 else None, "pauses": len(pauses),
            "longest_pause": round(max(pauses), 2) if pauses else 0.0, "duration": round(dur, 1)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--audio", required=True)
    ap.add_argument("--target", required=True)
    ap.add_argument("--model", default="small", help="tiny|base|small|medium (bigger = slower, more accurate)")
    ap.add_argument("--lang", default="de")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--log", metavar="DOMAIN", help="append the result to <data>/<DOMAIN>/pronunciation.csv")
    a = ap.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    heard, audio = transcribe(a.audio, a.model, a.lang)
    report, extra = compare(a.target, heard)
    n = len(report) or 1
    ok = sum(r["status"] == "ok" for r in report)
    result = {
        "target": a.target,
        "heard": " ".join(h["w"] for h in heard),
        "intelligibility": round(100 * ok / n),
        "words": report,
        "extra_words": extra,
        "fluency": fluency(heard, audio),
    }
    if a.log:
        import csv
        import datetime as dt
        from _common import domain_dir
        path = domain_dir(a.log) / "pronunciation.csv"
        new = not path.exists()
        path.parent.mkdir(parents=True, exist_ok=True)
        f = result["fluency"]
        flagged = ";".join(f'{r["word"]}>{r.get("heard", r["status"])}' for r in report if r["status"] != "ok")
        with open(path, "a", newline="", encoding="utf-8") as fh:
            w = csv.writer(fh)
            if new:
                w.writerow(["date", "target", "heard", "intelligibility", "wpm", "pauses", "flagged"])
            w.writerow([dt.date.today().isoformat(), a.target, result["heard"], result["intelligibility"],
                        f["wpm"] or "", f["pauses"], flagged])
    if a.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    print(f"heard:            {result['heard']}")
    print(f"intelligibility:  {result['intelligibility']}% of target words heard clearly")
    flags = [r for r in report if r["status"] != "ok"]
    for r in flags:
        extra_info = {"unclear": f"heard, low confidence ({r.get('p')})", "missing": "not heard",
                      "misheard": f"heard as '{r.get('heard')}'"}[r["status"]]
        print(f"  - {r['word']}: {extra_info}")
    if extra:
        print(f"  extra words heard: {' '.join(extra)}")
    f = result["fluency"]
    if f["wpm"]:
        print(f"fluency:          {f['wpm']} words/min, {f['pauses']} pause(s) > {PAUSE}s, longest {f['longest_pause']}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
