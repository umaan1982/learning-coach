#!/usr/bin/env python3
"""Minimal AnkiConnect client (stdlib only).

Requires Anki desktop running with the AnkiConnect add-on (code 2055492159),
which listens on http://127.0.0.1:8765.

Commands:
  check                                   -> is Anki reachable? list decks
  add  --deck D --file cards.csv [--model Basic] [--domain ID] [--audio]
                                          -> add notes; CSV columns: front,back,tags[,say]
                                             (--audio: speak 'say' via edge-tts and attach
                                             it to the Back field)
                                             (tags space-separated). Falls back to
                                             <data>/<domain>/anki-import.csv if Anki
                                             is not reachable.
  due  --deck D                           -> number of cards due now in deck
  stats --deck D                          -> deck counts + cards reviewed today
"""
import argparse
import csv
import json
import os
import shutil
import sys
import tempfile
import urllib.error
import urllib.request
from pathlib import Path

from _common import domain_dir

URL = "http://127.0.0.1:8765"


class AnkiUnavailable(Exception):
    pass


def invoke(action: str, **params):
    payload = json.dumps({"action": action, "version": 6, "params": params}).encode()
    try:
        with urllib.request.urlopen(urllib.request.Request(URL, payload), timeout=5) as r:
            resp = json.load(r)
    except (urllib.error.URLError, ConnectionError, TimeoutError) as e:
        raise AnkiUnavailable(str(e)) from e
    if resp.get("error"):
        raise RuntimeError(f"AnkiConnect error on {action}: {resp['error']}")
    return resp["result"]


def read_cards(path):
    with open(path, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    for r in rows:
        if not r.get("front") or not r.get("back"):
            raise ValueError(f"row missing front/back: {r}")
    return rows


def cmd_check(_):
    v = invoke("version")
    decks = invoke("deckNames")
    print(f"AnkiConnect OK (api v{v}). Decks: {', '.join(decks)}")


def attach_audio(cards, notes, tmpdir, domain=None):
    """Generate TTS for each card's 'say' column and attach it to the Back field."""
    import asyncio
    import hashlib
    from speak import synth, VOICES, RATE
    from _common import domain_settings
    lang = (domain_settings(domain).get("tts_lang") if domain else None) or "de-DE"
    voice = VOICES.get(lang, VOICES["de-DE"])[0]
    made = 0
    for c, n in zip(cards, notes):
        text = (c.get("say") or "").strip()
        if not text:
            continue
        name = "lc-" + hashlib.sha1(text.encode("utf-8")).hexdigest()[:12] + ".mp3"
        path = os.path.join(tmpdir, name)
        try:
            asyncio.run(synth(text, voice, RATE["normal"], Path(path)))
        except Exception as e:  # keep the card, just without sound
            print(f"audio skipped for '{text}': {e}", file=sys.stderr)
            continue
        n["audio"] = [{"path": path, "filename": name, "fields": ["Back"]}]
        made += 1
    return made


def cmd_add(a):
    cards = read_cards(a.file)
    try:
        invoke("createDeck", deck=a.deck)
        notes = [
            {
                "deckName": a.deck,
                "modelName": a.model,
                "fields": {"Front": c["front"], "Back": c["back"]},
                "tags": (c.get("tags") or "").split(),
                "options": {"allowDuplicate": False, "duplicateScope": "deck"},
            }
            for c in cards
        ]
        tmp = tempfile.mkdtemp(prefix="lc-audio-")
        if a.audio:
            print(f"audio attached to {attach_audio(cards, notes, tmp, a.domain)} card(s)")
        allowed = invoke("canAddNotes", notes=notes)
        to_add = [n for n, ok in zip(notes, allowed) if ok]
        ids = invoke("addNotes", notes=to_add) if to_add else []
        added = sum(1 for i in ids if i)
        print(f"added {added} card(s) to '{a.deck}'; skipped {len(notes) - len(to_add)} duplicate/invalid")
        shutil.rmtree(tmp, ignore_errors=True)  # AnkiConnect has copied the audio into Anki's media folder
    except AnkiUnavailable:
        if not a.domain:
            print("Anki not reachable and no --domain given for fallback file", file=sys.stderr)
            return 2
        out = domain_dir(a.domain) / "anki-import.csv"
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, "a", newline="", encoding="utf-8") as f:
            w = csv.writer(f, delimiter="\t")
            for c in cards:
                w.writerow([c["front"], c["back"], c.get("tags", "")])
        print(f"Anki not reachable: queued {len(cards)} card(s) in {out} (import via File > Import, Tab separator)"
              + ("; audio needs Anki running, re-add with --audio later" if a.audio else ""))
    return 0


def cmd_due(a):
    print(len(invoke("findCards", query=f'deck:"{a.deck}" is:due')))


def cmd_stats(a):
    stats = invoke("getDeckStats", decks=[a.deck])
    today = invoke("getNumCardsReviewedToday")
    for s in stats.values():
        print(f"{s['name']}: new {s['new_count']}, learning {s['learn_count']}, review due {s['review_count']}, total {s['total_in_deck']}")
    print(f"reviewed today (all decks): {today}")


def main() -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("check")
    p = sub.add_parser("add")
    p.add_argument("--deck", required=True)
    p.add_argument("--file", required=True)
    p.add_argument("--model", default="Basic")
    p.add_argument("--domain")
    p.add_argument("--audio", action="store_true", help="attach TTS audio from the CSV's 'say' column (needs edge-tts)")
    for name in ("due", "stats"):
        q = sub.add_parser(name)
        q.add_argument("--deck", required=True)
    a = ap.parse_args()
    try:
        return {"check": cmd_check, "add": cmd_add, "due": cmd_due, "stats": cmd_stats}[a.cmd](a) or 0
    except AnkiUnavailable:
        print(
            "Anki is not reachable at 127.0.0.1:8765. Start Anki desktop with the AnkiConnect add-on "
            "(Tools > Add-ons > Get Add-ons > code 2055492159), then retry.",
            file=sys.stderr,
        )
        return 2


if __name__ == "__main__":
    sys.exit(main())
