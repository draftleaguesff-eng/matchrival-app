#!/usr/bin/env python3
"""
Download NFL player headshots from ESPN CDN.
Strategy: query ESPN team roster API per team → match by name → download headshot.
"""
import json, re, time, urllib.request, urllib.parse, os, ssl

# macOS ships without root certs for Python; bypass verification for ESPN CDN
SSL_CTX = ssl._create_unverified_context()

HEADSHOTS_DIR = "/Users/alen/MissionControl/matchrival-app/public/headshots"
ROSTERS_FILE  = "/Users/alen/MissionControl/matchrival-app/public/week1-rosters.json"

TEAM_MAP = {
    "NE": "ne",  "SEA": "sea", "SF": "sf",  "LAR": "lar",
    "CHI": "chi","CAR": "car", "TB": "tb",  "CIN": "cin",
    "NO": "no",  "DET": "det", "BUF": "buf","HOU": "hou",
    "BAL": "bal","IND": "ind", "CLE": "cle","JAX": "jax",
    "ATL": "atl","PIT": "pit", "NYJ": "nyj","TEN": "ten",
    "ARI": "ari","LAC": "lac", "MIA": "mia","LV": "lv",
    "GB": "gb",  "MIN": "min", "WAS": "wsh","PHI": "phi",
    "DAL": "dal","NYG": "nyg", "DEN": "den","KC": "kc",
}

def normalize_name(name):
    return re.sub(r"[^a-z]", "", name.lower())

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=SSL_CTX, timeout=15) as r:
        return json.loads(r.read())

def get_espn_roster(team_slug):
    """Fetch ESPN roster; return dict of normalized_name → (full_name, athlete_id)."""
    url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team_slug}/roster"
    try:
        data = fetch_json(url)
        roster = {}
        for group in data.get("athletes", []):
            for athlete in group.get("items", []):
                full_name  = athlete.get("fullName", "")
                athlete_id = str(athlete.get("id", ""))
                if full_name and athlete_id:
                    roster[normalize_name(full_name)] = (full_name, athlete_id)
        return roster
    except Exception as e:
        print(f"  ERROR fetching roster for {team_slug}: {e}")
        return {}

def headshot_filename(player_name):
    """'First Last' → 'Last_First.jpg'"""
    parts = player_name.strip().split(" ", 1)
    if len(parts) == 2:
        return f"{parts[1]}_{parts[0]}.jpg"
    return f"{parts[0]}.jpg"

def download_headshot(athlete_id, filename):
    """Download headshot from ESPN CDN; return True on success."""
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
        print(f"  FAILED {filename}: {e}")
        return False

def main():
    os.makedirs(HEADSHOTS_DIR, exist_ok=True)

    with open(ROSTERS_FILE) as f:
        rosters = json.load(f)

    # Collect unique teams and their players
    team_players = {}
    for matchup in rosters.values():
        for side in ("away", "home"):
            team  = matchup[side]
            abbr  = team["abbr"]
            if abbr not in team_players:
                team_players[abbr] = []
            for slot_group in ("offense", "defense"):
                for player in team[slot_group].values():
                    team_players[abbr].append(player["name"])

    results = {}  # player_name → headshot filename (just filename, not path)

    for abbr, player_names in sorted(team_players.items()):
        slug = TEAM_MAP.get(abbr)
        if not slug:
            print(f"No ESPN slug for {abbr}, skipping")
            continue

        print(f"\n{'='*52}")
        print(f"  {abbr} ({slug})")
        espn_roster = get_espn_roster(slug)
        time.sleep(0.4)

        for player_name in player_names:
            if player_name in results:
                continue

            norm  = normalize_name(player_name)
            match = espn_roster.get(norm)

            if not match:
                # Fallback: match on last name only (if > 3 chars)
                parts = player_name.strip().split()
                last  = normalize_name(parts[-1]) if len(parts) > 1 else norm
                if len(last) > 3:
                    for k, v in espn_roster.items():
                        if k.endswith(last):
                            match = v
                            break

            if match:
                full_name, athlete_id = match
                fname = headshot_filename(player_name)
                ok    = download_headshot(athlete_id, fname)
                results[player_name] = fname if ok else None
                status = "✓" if ok else "✗"
                print(f"  {status} {player_name} ({athlete_id}) → {fname}")
            else:
                results[player_name] = None
                print(f"  ? {player_name} — not found in ESPN roster")

            time.sleep(0.12)

    results_file = "/Users/alen/MissionControl/matchrival-app/scripts/headshot_results.json"
    with open(results_file, "w") as f:
        json.dump(results, f, indent=2)

    found   = sum(1 for v in results.values() if v)
    missing = sum(1 for v in results.values() if not v)
    print(f"\nDone: {found} downloaded, {missing} not found")
    print(f"Results → {results_file}")

if __name__ == "__main__":
    main()
