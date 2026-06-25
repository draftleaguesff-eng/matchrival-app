#!/usr/bin/env python3
"""
Fix missing headshots for players in TS matchup-data files.
Steps: scan TS files → resolve full names → ESPN search → download → inject.
"""
import os, re, glob, json, time, ssl, urllib.parse, urllib.request
from collections import defaultdict

DATA_DIR      = "src/lib/matchup-data"
ROSTERS_FILE  = "public/week1-rosters.json"
HEADSHOTS_DIR = "public/headshots"
SSL_CTX       = ssl._create_unverified_context()

# ── Step 1: Collect missing players from TS files ─────────────────────────────
print("Step 1: Scanning TS files for missing headshots…")
missing = []  # [{file, display, ringType}]
for ts_file in sorted(glob.glob(f"{DATA_DIR}/*.ts")):
    if ts_file.endswith("index.ts"):
        continue
    fname = os.path.basename(ts_file)
    with open(ts_file) as f:
        content = f.read()
    for line in content.split("\n"):
        m = re.search(r'display: "([^"]+)"', line)
        if m and "headshot:" not in line:
            ring = ""
            rm = re.search(r'ringType: "([^"]+)"', line)
            if rm:
                ring = rm.group(1)
            missing.append({"file": fname, "display": m.group(1), "ringType": ring})

print(f"  {len(missing)} players without headshots\n")

# ── Step 2: Resolve full names from roster JSON ───────────────────────────────
print("Step 2: Resolving full names from roster JSON…")

with open(ROSTERS_FILE) as f:
    rosters = json.load(f)

# Derive game key from filename (e.g. "gb-min.ts" → "GB_MIN")
def file_to_game_key(fname):
    parts = fname.replace(".ts", "").split("-")
    return "_".join(p.upper() for p in parts)

# Build per-game player list: game_key → list of {name, pos, slot}
game_players = {}
for game_key, matchup in rosters.items():
    players = []
    for side in ("away", "home"):
        for slot_group in ("offense", "defense"):
            for slot, p in matchup[side][slot_group].items():
                players.append({
                    "name": p["name"],
                    "pos":  p.get("pos", ""),
                    "slot": slot,
                    "side": side,
                })
    game_players[game_key] = players

def last_name_from_display(display):
    """Extract the primary last name, ignoring suffixes like Jr./Sr./II/III."""
    suffixes = {"Jr.", "Sr.", "II", "III", "IV", "Jr", "Sr"}
    parts = display.strip().split()
    # Skip leading abbreviated segments (contain '.' or are single char)
    for i, p in enumerate(parts):
        if "." not in p and len(p) > 1:
            remaining = parts[i:]
            name_parts = [w for w in remaining if w not in suffixes]
            return name_parts[-1] if name_parts else p
    return parts[-1]

# Position group mapping (ringType → NFL pos abbreviations)
RING_TO_POS = {
    "qb": ["QB"],
    "wr": ["WR"],
    "te": ["TE"],
    "rb": ["RB", "FB"],
    "slot": ["WR", "TE"],
    "ol": ["LT", "LG", "C", "RG", "RT", "OL", "G", "T"],
    "cb": ["CB"],
    "s":  ["SS", "FS", "S"],
    "lb": ["LB", "ILB", "OLB", "MLB"],
    "de": ["DE", "DT", "NT", "DL"],
    "nt": ["DT", "NT", "DE"],
    "dt": ["DT", "NT"],
}

def ring_matches_pos(ring_type, nfl_pos):
    if not ring_type:
        return True
    accepted = RING_TO_POS.get(ring_type, [])
    return nfl_pos.upper() in accepted

resolved   = []
unresolved = []

for p in missing:
    fname    = p["file"]
    display  = p["display"]
    ring     = p["ringType"]
    game_key = file_to_game_key(fname)
    players  = game_players.get(game_key, [])

    last = last_name_from_display(display).lower().rstrip(".")

    # Filter candidates: last name match + position match
    candidates = [
        pl for pl in players
        if last in pl["name"].lower().split()[-1].lower()
        or (len(last) >= 4 and last in pl["name"].lower())
    ]

    # Further filter by position if ring type is known
    if ring and len(candidates) > 1:
        pos_filtered = [c for c in candidates if ring_matches_pos(ring, c["pos"])]
        if pos_filtered:
            candidates = pos_filtered

    # Filter by first initial
    first_initial = display[0].upper()
    init_filtered = [c for c in candidates if c["name"][0].upper() == first_initial]
    if init_filtered:
        candidates = init_filtered

    if len(candidates) == 1:
        full = candidates[0]["name"]
        resolved.append({**p, "full_name": full})
    elif len(candidates) > 1:
        # Take first; log the ambiguity
        full = candidates[0]["name"]
        resolved.append({**p, "full_name": full})
        print(f"  AMBIGUOUS '{display}' (ring={ring}) → chose '{full}' from {[c['name'] for c in candidates]}")
    else:
        # Fallback: search ALL games
        all_candidates = []
        for gp_list in game_players.values():
            for pl in gp_list:
                if last in pl["name"].lower():
                    all_candidates.append(pl)
        if all_candidates:
            full = all_candidates[0]["name"]
            resolved.append({**p, "full_name": full})
            print(f"  GLOBAL FALLBACK '{display}' → '{full}'")
        else:
            unresolved.append(p)
            print(f"  NOT FOUND '{display}' (last='{last}', game={game_key})")

print(f"\n  Resolved: {len(resolved)}, Unresolved: {len(unresolved)}\n")

# ── Step 3: ESPN search for player IDs ────────────────────────────────────────
print("Step 3: Looking up ESPN player IDs…")

def espn_search(full_name):
    """Return ESPN athlete ID, or None. Response: flat .items[] list."""
    q = urllib.parse.quote(full_name)
    url = (f"https://site.api.espn.com/apis/common/v3/search"
           f"?query={q}&limit=5&type=player&sport=football&league=nfl")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=10) as r:
            data = json.loads(r.read())
    except Exception as e:
        print(f"    search error '{full_name}': {e}")
        return None

    target_last = full_name.strip().split()[-1].lower().rstrip(".")
    for item in data.get("items", []):
        if not isinstance(item, dict):
            continue
        if item.get("type") != "player":
            continue
        athlete_id = item.get("id")
        if not athlete_id:
            continue
        display_name = (item.get("displayName") or item.get("shortName") or "").lower()
        if target_last in display_name:
            return str(athlete_id)
    return None

for p in resolved:
    p["espn_id"] = espn_search(p["full_name"])
    if p["espn_id"]:
        print(f"  ✓ {p['full_name']} → id={p['espn_id']}")
    else:
        print(f"  ✗ {p['full_name']} → NOT FOUND")
    time.sleep(0.3)

found_ids = [p for p in resolved if p.get("espn_id")]
print(f"\n  ESPN IDs found: {len(found_ids)}/{len(resolved)}\n")

# ── Step 4: Download headshots ────────────────────────────────────────────────
print("Step 4: Downloading headshots…")
os.makedirs(HEADSHOTS_DIR, exist_ok=True)

def headshot_filename(full_name):
    parts = full_name.strip().split(" ", 1)
    return f"{parts[1]}_{parts[0]}.jpg" if len(parts) == 2 else f"{parts[0]}.jpg"

def download_headshot(athlete_id, filename):
    dest = os.path.join(HEADSHOTS_DIR, filename)
    if os.path.exists(dest):
        return True
    url = f"https://a.espncdn.com/i/headshots/nfl/players/full/{athlete_id}.png"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as r:
            data = r.read()
        if len(data) < 1000:
            return False
        with open(dest, "wb") as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"    download failed {filename}: {e}")
        return False

downloaded = 0
for p in found_ids:
    fname = headshot_filename(p["full_name"])
    ok    = download_headshot(p["espn_id"], fname)
    p["headshot_file"] = fname if ok else None
    if ok:
        downloaded += 1
        print(f"  ✓ {p['full_name']} → {fname}")
    else:
        print(f"  ✗ {p['full_name']} — download failed")
    time.sleep(0.1)

print(f"\n  Downloaded: {downloaded}\n")

# ── Step 5: Inject headshot field into TS files ───────────────────────────────
print("Step 5: Injecting headshot fields into TS files…")

injected_total = 0
by_file = defaultdict(list)
for p in found_ids:
    if p.get("headshot_file"):
        by_file[p["file"]].append(p)

for fname, players in sorted(by_file.items()):
    ts_path = os.path.join(DATA_DIR, fname)
    with open(ts_path) as f:
        lines = f.readlines()

    file_injected = 0
    for p in players:
        display  = p["display"]
        hfile    = p["headshot_file"]
        ring     = p.get("ringType", "")
        search_key = f'display: "{display}"'

        for i, line in enumerate(lines):
            if search_key not in line:
                continue
            # Skip lines that already have a headshot
            if "headshot:" in line:
                continue
            # Optionally verify ringType matches to handle duplicate display names
            if ring and f'ringType: "{ring}"' not in line:
                continue
            stripped = line.rstrip("\n")
            if stripped.rstrip().endswith("},"):
                new_line = stripped.rstrip()[:-2] + f', headshot: "{hfile}" }},'
                lines[i]  = new_line + "\n"
                file_injected += 1
                injected_total += 1
            elif stripped.rstrip().endswith("}"):
                new_line = stripped.rstrip()[:-1] + f', headshot: "{hfile}" }}'
                lines[i]  = new_line + "\n"
                file_injected += 1
                injected_total += 1
            else:
                print(f"  ! Unexpected line format for {display}: {stripped[:80]}")
            break  # only inject once per player

    with open(ts_path, "w") as f:
        f.writelines(lines)
    if file_injected:
        print(f"  ✓ {fname}: {file_injected} injected")

# ── Step 6: Report ────────────────────────────────────────────────────────────
print(f"""
════════════════════════════════
  Missing players found:  {len(missing)}
  Full names resolved:    {len(resolved)}
  ESPN IDs found:         {len(found_ids)}
  Headshots downloaded:   {downloaded}
  Injected into TS files: {injected_total}
════════════════════════════════
""")
