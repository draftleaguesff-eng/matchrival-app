#!/usr/bin/env python3
"""
Second-pass headshot downloader: fetch ALL 32 team rosters, build a global
name→id lookup, then re-try every player that failed in pass 1.
"""
import json, re, time, urllib.request, os, ssl

SSL_CTX = ssl._create_unverified_context()

HEADSHOTS_DIR  = "/Users/alen/MissionControl/matchrival-app/public/headshots"
RESULTS_FILE   = "/Users/alen/MissionControl/matchrival-app/scripts/headshot_results.json"
ROSTERS_FILE   = "/Users/alen/MissionControl/matchrival-app/public/week1-rosters.json"

ALL_SLUGS = [
    "ne","sea","sf","lar","chi","car","tb","cin","no","det",
    "buf","hou","bal","ind","cle","jax","atl","pit","nyj","ten",
    "ari","lac","mia","lv","gb","min","wsh","phi","dal","nyg","den","kc",
]

def normalize(name):
    return re.sub(r"[^a-z]", "", name.lower())

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as r:
        return json.loads(r.read())

def headshot_filename(player_name):
    parts = player_name.strip().split(" ", 1)
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
        print(f"    FAILED {filename}: {e}")
        return False

# ── Step 1: build global roster ────────────────────────────────────────────────
print("Building global ESPN roster across all 32 teams…")
global_roster = {}  # normalized_name → (full_name, athlete_id)

for slug in ALL_SLUGS:
    url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{slug}/roster"
    try:
        data = fetch_json(url)
        count = 0
        for group in data.get("athletes", []):
            for athlete in group.get("items", []):
                full_name  = athlete.get("fullName", "")
                athlete_id = str(athlete.get("id", ""))
                if full_name and athlete_id:
                    key = normalize(full_name)
                    if key not in global_roster:
                        global_roster[key] = (full_name, athlete_id)
                    count += 1
        print(f"  {slug}: {count} athletes")
    except Exception as e:
        print(f"  {slug}: ERROR — {e}")
    time.sleep(0.3)

print(f"\nGlobal roster: {len(global_roster)} unique athletes\n")

# ── Step 2: retry missing players ─────────────────────────────────────────────
with open(RESULTS_FILE) as f:
    results = json.load(f)

with open(ROSTERS_FILE) as f:
    rosters = json.load(f)

# Collect full names from roster JSON
all_players = set()
for matchup in rosters.values():
    for side in ("away", "home"):
        for slot_group in ("offense", "defense"):
            for player in matchup[side][slot_group].values():
                all_players.add(player["name"])

missing = [p for p in all_players if not results.get(p)]
print(f"Retrying {len(missing)} players against global roster…\n")

newly_found = 0

for player_name in sorted(missing):
    norm  = normalize(player_name)
    match = global_roster.get(norm)

    if not match:
        # Last-name fallback (4+ char last name)
        parts = player_name.strip().split()
        last  = normalize(parts[-1]) if len(parts) > 1 else norm
        if len(last) >= 4:
            for k, v in global_roster.items():
                if k.endswith(last):
                    match = v
                    break

    if match:
        full_name, athlete_id = match
        fname = headshot_filename(player_name)
        ok    = download_headshot(athlete_id, fname)
        if ok:
            results[player_name] = fname
            newly_found += 1
            print(f"  ✓ {player_name} → {fname}")
        else:
            print(f"  ✗ {player_name} (id:{athlete_id}) — download failed")
    else:
        print(f"  ? {player_name} — not in global roster")

    time.sleep(0.1)

# Save updated results
with open(RESULTS_FILE, "w") as f:
    json.dump(results, f, indent=2)

found   = sum(1 for v in results.values() if v)
missing2 = sum(1 for v in results.values() if not v)
print(f"\nPass 2 done: +{newly_found} newly found")
print(f"Total: {found} downloaded, {missing2} still missing")
