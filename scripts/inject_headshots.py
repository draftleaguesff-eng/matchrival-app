#!/usr/bin/env python3
"""
Inject headshot filenames into the generated matchup-data TS files.
For each player that has a downloaded headshot, finds the player's
line in the corresponding TS file by display+initials key and adds
headshot: "filename.jpg" before the closing }.
"""
import json, os, re

RESULTS_FILE = "/Users/alen/MissionControl/matchrival-app/scripts/headshot_results.json"
ROSTERS_FILE = "/Users/alen/MissionControl/matchrival-app/public/week1-rosters.json"
DATA_DIR     = "/Users/alen/MissionControl/matchrival-app/src/lib/matchup-data"

KEY_TO_FILENAME = {
    "SF_LAR":  "sf-lar",  "CHI_CAR": "chi-car", "TB_CIN":  "tb-cin",
    "NO_DET":  "no-det",  "BUF_HOU": "buf-hou", "BAL_IND": "bal-ind",
    "CLE_JAX": "cle-jax", "ATL_PIT": "atl-pit", "NYJ_TEN": "nyj-ten",
    "ARI_LAC": "ari-lac", "MIA_LV":  "mia-lv",  "GB_MIN":  "gb-min",
    "WAS_PHI": "was-phi", "DAL_NYG": "dal-nyg",  "DEN_KC":  "den-kc",
}

def to_display(name):
    parts = name.strip().split()
    if len(parts) == 1:
        return name
    return f"{parts[0][0]}. {' '.join(parts[1:])}"

with open(RESULTS_FILE) as f:
    results = json.load(f)

with open(ROSTERS_FILE) as f:
    rosters = json.load(f)

injected = 0
skipped  = 0
not_found = 0
already   = 0

for key, filename in KEY_TO_FILENAME.items():
    game = rosters.get(key)
    if not game:
        continue

    ts_path = os.path.join(DATA_DIR, f"{filename}.ts")
    with open(ts_path) as f:
        lines = f.readlines()

    modified = False

    for side in ("away", "home"):
        team = game[side]
        for slot_group in ("offense", "defense"):
            for slot, player in team[slot_group].items():
                full_name = player["name"]
                initials  = player["initials"]
                display   = to_display(full_name)
                fname     = results.get(full_name)

                if not fname:
                    skipped += 1
                    continue

                # Search key unique within the file per player
                search_key = f'display: "{display}", initials: "{initials}"'

                found_in_file = False
                for i, line in enumerate(lines):
                    if search_key in line:
                        if 'headshot:' in line:
                            already += 1
                            found_in_file = True
                            break
                        # Insert headshot before the closing },
                        stripped = line.rstrip('\n')
                        if stripped.rstrip().endswith('},'):
                            new_line = stripped.rstrip()[:-2] + f', headshot: "{fname}" }},'
                            lines[i] = new_line + '\n'
                            injected += 1
                            modified = True
                            found_in_file = True
                            break
                        else:
                            print(f"  ! Line doesn't end with }},: {stripped[:80]}")

                if not found_in_file:
                    print(f"  ? Not found: '{search_key}' in {filename}.ts")
                    not_found += 1

    if modified:
        with open(ts_path, 'w') as f:
            f.writelines(lines)
        print(f"  ✓ {filename}.ts")

print(f"\nDone: {injected} injected, {already} already present, "
      f"{skipped} skipped (no headshot), {not_found} not found in file")
