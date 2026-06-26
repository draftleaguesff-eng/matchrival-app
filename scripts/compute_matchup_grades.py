#!/usr/bin/env python3
"""
Compute matchup summary grades for all 16 Week 1 games and inject into TS files.
Computes both away-offense and home-offense directions, selects top 5 per game.
"""
import os, re, glob

DATA_DIR = "src/lib/matchup-data"

# ── Grade scale (diff = offense_avg − defense_avg) ────────────────────────────
def grade_pair(diff):
    if diff >= 6:   return "A",  "C-"
    if diff >= 3:   return "B+", "C"
    if diff >= 1:   return "B",  "C+"
    if diff >= -1:  return "B",  "B"
    if diff >= -3:  return "C+", "B"
    if diff >= -6:  return "C",  "B+"
    return "C-", "A"

GRADE_RANK = {"A": 6, "B+": 5, "B": 4, "C+": 3, "C": 2, "C-": 1}

def interest_score(off_g, def_g, players):
    gap = abs(GRADE_RANK.get(off_g, 4) - GRADE_RANK.get(def_g, 4))
    star_bonus = sum(
        4 if p.get("rating", 0) >= 95 else
        3 if p.get("rating", 0) >= 90 else
        2 if p.get("rating", 0) >= 85 else
        1 if p.get("rating", 0) >= 80 else 0
        for p in players
    )
    return gap * 3 + star_bonus

# ── Analyst notes + verdicts (hard-coded per PRIME orders) ───────────────────
GAME_NOTES = {
    "ne-sea": {
        "verdict": "SEA defending champs at home — but Maye and Henry create real mismatches in the passing game",
        "a_WR1": "A.J. Brown (89) vs Devon Witherspoon (91 hybrid) — analysts call this the game's defining individual battle",
        "a_Pass_Pro": "NE's patchwork OLine (avg 75.8) faces D. Witherspoon (91) off the edge — pressure expected inside the first two drives",
        "a_TE": "H. Henry (86) exploits mismatches — SEA's inside linebackers (avg 79.0) are overmatched in coverage",
    },
    "sf-lar": {
        "verdict": "LAR favored but SF is a live underdog — Trent Williams (97) at LT is the difference maker if healthy",
        "a_Pass_Pro": "T. Williams (97) vs B. Huff (82) — if Williams stays healthy, Purdy has a clean pocket and SF wins this game",
        "h_WR1": "P. Nacua (97) vs D. Lenoir (79) — analysts calling Nacua the WR1 breakout of the year; SF secondary has no real answer",
        "a_TE": "G. Kittle (97) creates massive mismatches — LAR's interior LBs (avg 72.5) simply can't cover him",
    },
    "chi-car": {
        "verdict": "CHI's OLine upgrade with Thuney (92) gives Williams a clean pocket — Bears cover",
        "a_Pass_Pro": "J. Thuney (92) anchors CHI's revised OLine vs CAR's M. Murphy (78) — clean pocket expected for C. Williams",
        "a_WR1": "M. Sweat (90) vs CAR's I. Ekwonu (79) LT — Sweat terrorizes this game; analysts say it defines Bryce Young's contract year",
    },
    "tb-cin": {
        "verdict": "Highest total of Week 1 (50.5) — Burrow-Chase too dynamic, but Mayfield keeps it close through three quarters",
        "h_WR1": "J. Chase (99) vs A. Winfield Jr. (94) bracket — analysts say Chase sees 140+ yards unless TB double-teams constantly",
        "a_WR1": "V. Vea (90) as pass rush anchor vs TB's OLine — Vita Vea demands double teams, springing pressure from every angle",
    },
    "no-det": {
        "verdict": "DET averaged 9.5-pt margin at Ford Field in 2025 — Shough faces the wrong defense in Week 1",
        "h_RB": "J. Gibbs (95) vs NO's LBs — D. Davis (90) is the lone matchup; analysts say Gibbs makes it look easy in the first half",
        "h_WR1": "A. St. Brown (96) vs NO's secondary — explosive WR1 debut in a game DET should control from wire to wire",
        "a_QB": "A. Hutchinson (93) vs NO's OLine — Shough will be running for his life early per analysts; worst possible debut test",
    },
    "buf-hou": {
        "verdict": "Elite-on-elite — Allen's experience edge is the difference in Q4; Bills edge a close one",
        "a_Pass_Pro": "D. Dawkins (91) vs W. Anderson Jr. (91) — analysts say whoever wins this single rep determines the game's tone",
        "h_WR1": "N. Collins (88) vs C. Benford (85) — HOU's best weapon vs BUF's most-tested corner; premier late-window battle",
        "a_QB": "J. Allen (99) vs HOU's elite pass rush (Anderson 91 + Hunter 91) — Allen's quick release is the great equalizer",
    },
    "bal-ind": {
        "verdict": "Lamar + Henry open 2026 with a statement — Daniel Jones' Achilles recovery is IND's biggest question mark",
        "a_RB": "D. Henry (98) vs IND's interior — Q. Nelson (92) paves the way; CBS calls it an irresistible force vs immovable object",
        "a_QB": "L. Jackson (99) vs D. Buckner (88) + K. Paye (80) — Jackson's mobility is historically the great equalizer against any pass rush",
        "h_Pass_Pro": "T. Hendrickson (92) vs B. Raimann (80) LT — BAL's marquee defensive addition; Raimann's improvement is IND's swing factor",
    },
    "cle-jax": {
        "verdict": "JAX on 8-game win streak — Garrett (99) vs Harrison is the battle, but CLE's offense can't keep pace",
        "h_Pass_Pro": "M. Garrett (99) vs A. Harrison (79) LT — analysts say if Garrett wins this battle, CLE can stay in it; most likely he does",
        "h_WR1": "T. Hunter (84) slot debut vs M. Emerson Jr. (76) — Travis Hunter's first full NFL season under immediate spotlight",
    },
    "atl-pit": {
        "verdict": "Watt (99) + Heyward (94) make life miserable for Penix on primetime debut — PIT covers at home",
        "a_Pass_Pro": "T.J. Watt (99) vs ATL's OLine — could wreck the game inside the first two drives, analysts say",
        "h_WR1": "D. Metcalf (85) vs A.J. Terrell (86) — the showcase individual matchup analysts most want to see after the offseason trade",
        "a_QB": "M. Penix Jr. (72) vs T.J. Watt (99) — worst possible debut environment for Penix; Watt generates pressure every other snap",
    },
    "nyj-ten": {
        "verdict": "Saleh's revenge game — lowest total of Week 1 (39.5), defensive grind, Titans win at home",
        "h_WR1": "J. Simmons (95) at NT vs NYJ's interior — dominant presence that makes TEN's defense legitimately scary all game",
        "a_WR1": "S. Gardner (94) vs TEN's WR corps — Sauce shuts down Boyd (76) and forces Cam Ward into second and third reads",
        "h_QB": "C. Ward (82) in Saleh's system — coach has inside knowledge of NYJ tendencies; Saleh's first film session was probably against his old team",
    },
    "ari-lac": {
        "verdict": "Largest spread of the week — LAC's Mack/Bosa/James triple threat too much; Chargers win by 17+",
        "a_Pass_Pro": "K. Mack (87) + J. Bosa (83) vs ARI's OLine — most one-sided pass rush matchup on the slate per analyst consensus",
        "h_WR1": "D. James (94) as eraser vs ARI's passing game — best safety in football shuts down half the field on every snap",
        "a_WR1": "M. Harrison Jr. (87) vs A. Samuel Jr. (80) — ARI's best weapon vs LAC's CB1; Harrison has to win this if ARI has any shot",
    },
    "mia-lv": {
        "verdict": "Hill runs free early; Crosby vs Armstead is LV's only hope — MIA wins, LV covers",
        "a_WR1": "T. Hill (96) vs N. Hobbs (74) — most glaring individual mismatch of Week 1; Hill runs free and MIA builds an early lead",
        "h_TE": "B. Bowers (93) vs MIA's LBs — too fast for second-level defenders; analysts say 100+ yards is a realistic over/under",
        "h_Pass_Pro": "M. Crosby (97) vs T. Armstead (88) LT — LV's singular elite weapon vs MIA's only potential neutralizer; defines the game",
    },
    "gb-min": {
        "verdict": "Near pick'em — Jefferson vs Alexander is the marquee duel; sharp money on MIN, but Love edges it",
        "h_WR1": "J. Jefferson (99) vs J. Alexander (90) — #1 marquee individual matchup of Week 1 per analyst consensus; two top-10 players head-to-head",
        "a_QB": "J. Love (83) vs H. Smith (88) + MIN's over-the-top coverage — Love's deep ball timing tested early in a must-watch divisional opener",
    },
    "was-phi": {
        "verdict": "PHI dominant at home — Barkley (99) + Hurts impose their will; Daniels' health is WAS's swing factor",
        "h_RB": "S. Barkley (99) vs WAS's front — legendary 2025 season continues; D. Payne (84) is the only real hope for containing him",
        "a_WR1": "T. McLaurin (94) vs Q. Mitchell (89) — analysts say whoever wins this matchup dictates WAS's ability to put up points",
        "h_WR1": "J. Carter (89) + J. Greenard (85) vs WAS's OLine — PHI's defensive front tests L. Tunsil (95) immediately and often",
    },
    "dal-nyg": {
        "verdict": "Cowboys 11-1 all-time in opener vs NYG — Lamb (95) too much for a Giants team learning Harbaugh's system",
        "a_WR1": "C. Lamb (95) vs P. Adebo (78) — Lamb in the slot creates immediate mismatches; Adebo hasn't been elite since 2023",
        "h_Pass_Pro": "D. Lawrence (97) + B. Burns (89) vs DAL's OLine (Guyton 73 at LT) — Abdul Carter (81 rookie) adds to an already elite NYG front",
    },
    "den-kc": {
        "verdict": "Mahomes at Arrowhead in the opener — Surtain (97) limits Rice, but Kelce finds the soft spot every time",
        "h_TE": "T. Kelce (93) vs DEN linebackers — Singleton (76) overmatched in coverage; Kelce finds the soft spot every time in critical moments",
        "a_WR1": "P. Surtain II (97) vs R. Rice (84) — Surtain is the only corner who can legitimately make Mahomes uncomfortable all game",
        "h_QB": "P. Mahomes (95) at Arrowhead vs N. Bonitto (91) — even post-ACL, Mahomes' pocket presence and timing make DEN's rush look ordinary",
    },
}

ALL_POS = ["WR_LEFT","LT","LG","C","RG","RT","TE","SLOT","WR_RIGHT","QB","RB",
           "CB_LEFT","SS","FS","NB","OLB_L","ILB_L","ILB_R","OLB_R","DE_L","NT","DE_R"]

def parse_section(sec):
    data = {}
    m = re.search(r'abbr:\s*"([^"]+)"', sec)
    data["_abbr"] = m.group(1) if m else "?"
    for line in sec.split("\n"):
        for pos in ALL_POS:
            if re.match(rf'\s+{pos}:\s+\{{', line) or re.match(rf'\s+{pos}:\s*\{{', line):
                dm = re.search(r'display:\s*"([^"]+)"', line)
                rm = re.search(r'rating:\s*(\d+)', line)
                if dm and rm:
                    data[pos] = {"display": dm.group(1), "rating": int(rm.group(1))}
    return data

def avg_of(team, *pos_list):
    vals = [team[p]["rating"] for p in pos_list if p in team and team[p].get("rating", 0) > 0]
    return sum(vals) / len(vals) if vals else 0

def top_of(team, *pos_list):
    candidates = [(team[p]["display"], team[p]["rating"]) for p in pos_list if p in team]
    return max(candidates, key=lambda x: x[1], default=("?", 0))

def ts_escape(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')

# ── Category computation for one direction ────────────────────────────────────
def compute_direction(offense, defense, direction, file_key):
    """
    Compute all 8 categories for one direction.
    direction = "a" (away has ball) or "h" (home has ball).
    awayGrade = away team's relevant grade; homeGrade = home team's.
    """
    notes = GAME_NOTES.get(file_key, {})
    cats = []

    def entry(label, off_g, def_g, note, include, players):
        score = interest_score(off_g, def_g, players)
        if direction == "a":
            return {"label": label, "awayGrade": off_g, "homeGrade": def_g,
                    "note": note, "include": include, "score": score}
        else:
            return {"label": label, "awayGrade": def_g, "homeGrade": off_g,
                    "note": note, "include": include, "score": score}

    # 1. WR vs Secondary
    wr_a = avg_of(offense, "WR_LEFT", "SLOT", "WR_RIGHT")
    sec_a = avg_of(defense, "CB_LEFT", "NB", "SS", "FS")
    diff = wr_a - sec_a
    og, dg = grade_pair(diff)
    tw_n, tw_r = top_of(offense, "WR_LEFT", "SLOT", "WR_RIGHT")
    tc_n, tc_r = top_of(defense, "CB_LEFT", "NB")
    players = [offense.get(p, {}) for p in ("WR_LEFT","SLOT","WR_RIGHT")] + \
              [defense.get(p, {}) for p in ("CB_LEFT","NB","SS","FS")]
    note = notes.get(f"{direction}_WR_Sec",
        f"{tw_n} ({tw_r}) vs {tc_n} ({tc_r}) — receiving corps tests the opposing secondary")
    include = abs(diff) >= 3 or max(wr_a, sec_a) >= 88
    cats.append(entry("WR vs Secondary", og, dg, note, include, players))

    # 2. QB vs Pass Rush
    qb_r = offense.get("QB", {}).get("rating", 0)
    qb_n = offense.get("QB", {}).get("display", "QB")
    edge_a = avg_of(defense, "OLB_L", "OLB_R")
    diff = qb_r - edge_a
    og, dg = grade_pair(diff)
    te_n, te_r = top_of(defense, "OLB_L", "OLB_R")
    players = [offense.get("QB", {})] + [defense.get(p, {}) for p in ("OLB_L","OLB_R")]
    note = notes.get(f"{direction}_QB",
        f"{qb_n} ({qb_r}) vs {te_n} ({te_r}) — QB faces elite edge pressure")
    include = abs(diff) >= 3 or max(qb_r, edge_a) >= 85
    cats.append(entry("QB vs Pass Rush", og, dg, note, include, players))

    # 3. OL vs Run Defense
    ol_a = avg_of(offense, "LT","LG","C","RG","RT")
    dl_a = avg_of(defense, "DE_L","NT","DE_R")
    diff = ol_a - dl_a
    og, dg = grade_pair(diff)
    to_n, to_r = top_of(offense, "LT","LG","C","RG","RT")
    td_n, td_r = top_of(defense, "DE_L","NT","DE_R")
    players = [offense.get(p, {}) for p in ("LT","LG","C","RG","RT")] + \
              [defense.get(p, {}) for p in ("DE_L","NT","DE_R")]
    note = notes.get(f"{direction}_OL_RD",
        f"{to_n} ({to_r}) leads OLine vs {td_n} ({td_r}) — trench battle defines the run game")
    include = ol_a >= 84 or dl_a >= 86
    cats.append(entry("OL vs Run Defense", og, dg, note, include, players))

    # 4. TE Matchup
    te_r = offense.get("TE", {}).get("rating", 0)
    te_n2 = offense.get("TE", {}).get("display", "TE")
    ilb_a = avg_of(defense, "ILB_L","ILB_R")
    diff = te_r - ilb_a
    og, dg = grade_pair(diff)
    ti_n, ti_r = top_of(defense, "ILB_L","ILB_R")
    players = [offense.get("TE", {})] + [defense.get(p, {}) for p in ("ILB_L","ILB_R")]
    note = notes.get(f"{direction}_TE",
        f"{te_n2} ({te_r}) creates mismatches vs {ti_n} ({ti_r}) — TE vs linebacker coverage")
    include = te_r >= 82
    cats.append(entry("TE Matchup", og, dg, note, include, players))

    # 5. WR1 vs CB1
    wr1_n, wr1_r = top_of(offense, "WR_LEFT", "SLOT", "WR_RIGHT")
    cb1_n, cb1_r = top_of(defense, "CB_LEFT", "NB")
    diff = wr1_r - cb1_r
    og, dg = grade_pair(diff)
    players = [{"display": wr1_n, "rating": wr1_r}, {"display": cb1_n, "rating": cb1_r}]
    note = notes.get(f"{direction}_WR1",
        f"{wr1_n} ({wr1_r}) vs {cb1_n} ({cb1_r}) — individual star matchup defines this position battle")
    include = wr1_r >= 85 or cb1_r >= 85
    cats.append(entry("WR1 vs CB1", og, dg, note, include, players))

    # 6. Slot Matchup
    slot_r = offense.get("SLOT", {}).get("rating", 0)
    slot_n = offense.get("SLOT", {}).get("display", "SLOT")
    nb_r   = defense.get("NB", {}).get("rating", 0)
    nb_n   = defense.get("NB", {}).get("display", "NB")
    diff = slot_r - nb_r
    og, dg = grade_pair(diff)
    players = [offense.get("SLOT", {}), defense.get("NB", {})]
    note = notes.get(f"{direction}_Slot",
        f"{slot_n} ({slot_r}) vs {nb_n} ({nb_r}) — slot matchup in the middle of the field")
    include = slot_r >= 82 or nb_r >= 82 or abs(diff) >= 4
    cats.append(entry("Slot Matchup", og, dg, note, include, players))

    # 7. RB in Space
    rb_r = offense.get("RB", {}).get("rating", 0)
    rb_n = offense.get("RB", {}).get("display", "RB")
    ilb_a2 = avg_of(defense, "ILB_L","ILB_R")
    diff = rb_r - ilb_a2
    og, dg = grade_pair(diff)
    ti2_n, ti2_r = top_of(defense, "ILB_L","ILB_R")
    players = [offense.get("RB", {})] + [defense.get(p, {}) for p in ("ILB_L","ILB_R")]
    note = notes.get(f"{direction}_RB",
        f"{rb_n} ({rb_r}) vs {ti2_n} ({ti2_r}) — RB in space and catching out of backfield")
    include = rb_r >= 85 or diff >= 6
    cats.append(entry("RB in Space", og, dg, note, include, players))

    # 8. Pass Protection
    ol_a2 = avg_of(offense, "LT","LG","C","RG","RT")
    edge_a2 = avg_of(defense, "OLB_L","OLB_R")
    diff = ol_a2 - edge_a2
    og, dg = grade_pair(diff)
    to2_n, to2_r = top_of(offense, "LT","LG","C","RG","RT")
    te2_n, te2_r = top_of(defense, "OLB_L","OLB_R")
    players = [offense.get(p, {}) for p in ("LT","LG","C","RG","RT")] + \
              [defense.get(p, {}) for p in ("OLB_L","OLB_R")]
    note = notes.get(f"{direction}_Pass_Pro",
        f"{to2_n} ({to2_r}) anchors pass pro vs {te2_n} ({te2_r}) — edge pressure matchup")
    include = edge_a2 >= 83 or ol_a2 >= 85
    cats.append(entry("Pass Protection", og, dg, note, include, players))

    return cats

# ── Select top 5 from both directions ────────────────────────────────────────
def select_categories(away, home, file_key):
    cats_a = compute_direction(away, home, "a", file_key)
    cats_h = compute_direction(home, away, "h", file_key)
    all_cats = cats_a + cats_h

    # Keep only "include" categories
    interesting = [c for c in all_cats if c["include"]]

    # Sort by score descending
    interesting.sort(key=lambda c: c["score"], reverse=True)

    # De-dup by label — keep highest-scoring entry per label
    seen = {}
    for c in interesting:
        lbl = c["label"]
        if lbl not in seen or c["score"] > seen[lbl]["score"]:
            seen[lbl] = c

    # Pick top 5 by score
    final = sorted(seen.values(), key=lambda c: c["score"], reverse=True)[:5]
    # Restore order: most interesting first
    final.sort(key=lambda c: c["score"], reverse=True)
    return final

# ── Build TS string ───────────────────────────────────────────────────────────
def build_ts(categories, verdict):
    lines = ["  matchupSummary: {", "    grades: ["]
    for cat in categories:
        lines.append("      {")
        lines.append(f'        label: "{ts_escape(cat["label"])}",')
        lines.append(f'        awayGrade: "{ts_escape(cat["awayGrade"])}",')
        lines.append(f'        homeGrade: "{ts_escape(cat["homeGrade"])}",')
        lines.append(f'        note: "{ts_escape(cat["note"])}",')
        lines.append("      },")
    lines.append("    ],")
    lines.append(f'    verdict: "{ts_escape(verdict)}",')
    lines.append("  },")
    return "\n".join(lines)

# ── Inject into TS file ───────────────────────────────────────────────────────
def inject(ts_path, categories, verdict):
    with open(ts_path) as f:
        content = f.read()

    ts_block = build_ts(categories, verdict)

    # Remove existing matchupSummary block if present
    if "matchupSummary:" in content:
        # Find "  matchupSummary:" and remove through the next "  },"
        # Use a simple approach: split at the matchupSummary line
        idx = content.index("\n  matchupSummary:")
        # Find the end: look for "\n};" after idx (the file closing)
        end_idx = content.rindex("\n};")
        # The summary block is from idx to end_idx
        before = content[:idx]
        content = before + "\n};\n"

    # Insert before closing "};" (home section already ends with "  }," so no extra comma needed)
    idx = content.rindex("\n};")
    new_content = content[:idx] + "\n" + ts_block + "\n};\n"

    with open(ts_path, "w") as f:
        f.write(new_content)

# ── Main ──────────────────────────────────────────────────────────────────────
total_cats = 0
games_processed = 0

for ts_file in sorted(glob.glob(f"{DATA_DIR}/*.ts")):
    if ts_file.endswith("index.ts"):
        continue
    fname = os.path.basename(ts_file)
    file_key = fname.replace(".ts", "")

    content = open(ts_file).read()
    split_idx = content.index("  home: {")
    away = parse_section(content[:split_idx])
    home = parse_section(content[split_idx:])

    categories = select_categories(away, home, file_key)
    verdict = GAME_NOTES.get(file_key, {}).get(
        "verdict",
        f"{away['_abbr']} vs {home['_abbr']} — competitive matchup decided in the fourth quarter"
    )

    inject(ts_file, categories, verdict)
    games_processed += 1
    total_cats += len(categories)

    grade_summary = " | ".join(
        f"{c['label']}: {c['awayGrade']}/{c['homeGrade']}"
        for c in categories
    )
    print(f"  {fname}: {len(categories)} cats → {grade_summary}")

print(f"\n{games_processed} games, {total_cats} total categories "
      f"({total_cats/games_processed:.1f} avg per game)")
