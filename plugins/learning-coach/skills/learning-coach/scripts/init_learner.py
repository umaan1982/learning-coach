#!/usr/bin/env python3
"""Create a learner data folder for a domain from the skill's templates.

Usage: python init_learner.py --domain german-b1
Never overwrites existing files.
"""
import argparse
import datetime as dt
import shutil
import sys

from _common import SKILL_DIR, domain_dir


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--domain", required=True)
    args = ap.parse_args()

    if not (SKILL_DIR / "domains" / args.domain).is_dir():
        print(f"warning: no domain pack at domains/{args.domain} (create one first)", file=sys.stderr)

    target = domain_dir(args.domain)
    (target / "notes").mkdir(parents=True, exist_ok=True)
    created, kept = [], []
    for tpl in sorted((SKILL_DIR / "templates").iterdir()):
        dest = target / tpl.name
        if dest.exists():
            kept.append(tpl.name)
            continue
        if tpl.name == "profile.md":
            text = tpl.read_text(encoding="utf-8")
            text = text.replace("{{domain}}", args.domain).replace("{{today}}", dt.date.today().isoformat())
            dest.write_text(text, encoding="utf-8")
        else:
            shutil.copyfile(tpl, dest)
        created.append(tpl.name)

    print(f"data folder: {target}")
    print(f"created: {', '.join(created) or '-'}")
    print(f"already existed (untouched): {', '.join(kept) or '-'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
