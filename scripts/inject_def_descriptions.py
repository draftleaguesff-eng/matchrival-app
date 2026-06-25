#!/usr/bin/env python3
"""
Inject defDescription (and fix defScheme for ne-sea.ts) into all 16 matchup-data TS files.
Splits each file at '  home: {' to process away and home sections independently.
"""
import os, re

DATA_DIR = "/Users/alen/MissionControl/matchrival-app/src/lib/matchup-data"

# (away_defScheme_override, away_defDescription, home_defScheme_override, home_defDescription)
# override = None means leave defScheme unchanged
GAME_DESC = {
    "ne-sea": (
        "4-3 Base",
        "New England's base 4-3 applies heavy press coverage with Christian Gonzalez (98 OVR) shadowing the opponent's top receiver. Robert Spillane anchors the linebacker corps. Four-man rush relies on Christian Barmore and Harold Landry III to generate pressure without blitzing.",
        "3-4 Hybrid",
        "Seattle's Mike Macdonald scheme features a three-man DL anchored by Leonard Williams and DeMarcus Lawrence, with Devon Witherspoon as a versatile CB/LB hybrid. Primary coverage is Cover 3 zone with safety bracket help over the top. Aggressive blitz packages off the edge.",
    ),
    "sf-lar": (
        None,
        "Nick Bosa anchors a 4-3 front that generates elite interior pressure. Fred Warner (92 OVR) quarterbacks the LB corps in Cover 3 zone, with Deommodore Lenoir and Renardo Green in off-coverage. The 49ers funnel everything to the middle and rely on Warner to clean it up.",
        None,
        "The Rams run a 3-4 base under Sean McVay's defensive staff, with Bryce Huff as the primary edge rusher off the left side. Cover 3 zone underneath with safeties Tre'Von Moehrig and Eric Scott Jr. splitting deep thirds. Kobie Turner provides interior push as the 3-tech.",
    ),
    "chi-car": (
        None,
        "Montez Sweat (90 OVR) is the engine of Chicago's 4-3 pass rush, capable of winning from either side. Jaylon Johnson (86 OVR) plays press-man on the boundary while the interior pairs Grady Jarrett and Gervon Dexter. Cover 3 zone with Tremaine Edmunds dropping to the hook-curl.",
        None,
        "Carolina's 4-3 relies on Derrick Brown (82 OVR) as the disruptive DT and Jaycee Horn (84 OVR) as a physical press corner. Shaq Thompson and Josey Jewell man the inside linebackers in a Cover 3 zone scheme. Carolina generates most of its pressure via Myles Murphy off the edge.",
    ),
    "tb-cin": (
        None,
        "Tampa Bay's 3-4 is built around Antoine Winfield Jr. (94 OVR) as the chess piece — lines up everywhere from box safety to near-line blitzer. Vita Vea (90 OVR) is an immovable 1-tech who demands double teams. Yaya Diaby generates edge pressure in Cover 3 zone with two-high safety looks.",
        None,
        "Cincinnati's 4-3 pairs Sam Hubbard and Joseph Ossai as bookend DEs with Calijah Kancey providing interior quickness. Dax Hill (79 OVR) is a versatile SS who can match up in man. Germaine Pratt and Logan Wilson man the middle in Cover 3, with DJ Turner as the nickel.",
    ),
    "no-det": (
        None,
        "Demario Davis (90 OVR) is the heartbeat of New Orleans' 4-3 — a sideline-to-sideline ILB who diagnoses quickly. Cameron Jordan (84 OVR) remains effective off the edge at 36. Marshon Lattimore (84 OVR) is a shutdown corner in press man. Cover 3 zone with a hard edge-blitz tendency.",
        None,
        "Detroit's 3-4 features Aidan Hutchinson (93 OVR) as a top-5 edge rusher. Brian Branch (89 OVR) and Kerby Joseph (90 OVR) form one of the best safety duos in the league. Cover 3 zone with Branch operating as a hybrid box safety. Alim McNeill anchors the 0-tech.",
    ),
    "buf-hou": (
        None,
        "Buffalo's 3-4 under Sean McDermott is disciplined two-gap football. Greg Rousseau (88 OVR) rushes from the SAM OLB spot while Ed Oliver (83 OVR) is the interior disruptor at 1-tech. Cover 2 zone emphasizes wide-side corner Taron Johnson in the nickel. Terrel Bernard commands the inside.",
        None,
        "Houston's 4-3 features Will Anderson Jr. (91 OVR) and Danielle Hunter (91 OVR) as a terrifying bookend pass rush — one of the league's best. Derek Stingley Jr. (92 OVR) plays shadow coverage on the opponent's top receiver. Cover 3 zone with Jalen Pitre as an aggressive box safety.",
    ),
    "bal-ind": (
        None,
        "Baltimore's 3-4 is led by Roquan Smith (94 OVR), the most complete ILB in football. Trey Hendrickson (92 OVR) is the primary edge threat off the right side. Kyle Hamilton (91 OVR) can line up anywhere — SS, slot, or near-line. Marlon Humphrey (92 OVR) is a Pro Bowl corner. Cover 2 zone with bracket help over the top.",
        None,
        "Indianapolis' 4-3 is anchored by DeForest Buckner (88 OVR) as the interior force at 3-tech. Kwity Paye rushes from the strong-side OLB. Zaire Franklin and E.J. Speed are physical inside linebackers in Cover 3 zone. The secondary is sound but unspectacular — pressure must create turnovers.",
    ),
    "cle-jax": (
        None,
        "Myles Garrett (99 OVR) is the best defensive player in football and Cleveland's entire defensive identity. Denzel Ward (93 OVR) shadows #1 receivers in press man. Jeremiah Owusu-Koramoah (84 OVR) is a sideline-to-sideline rangy ILB. The Browns run Cover 3 but will play man behind Garrett's pressure.",
        None,
        "Jacksonville's 4-3 zone blitz scheme confuses protections with multiple looks. Josh Hines-Allen (90 OVR) is a premier edge rusher off the left side. Foyesade Oluokun (83 OVR) is one of the more underrated ILBs in football, leading the league in tackles multiple seasons. Tyson Campbell (82 OVR) handles the boundary corner.",
    ),
    "atl-pit": (
        None,
        "Atlanta's 4-3 relies on A.J. Terrell (86 OVR) as its best cover corner and Jessie Bates III (88 OVR) as the centerfield safety. Arnold Ebiketie and James Pearce Jr. provide edge pressure off the perimeter. Cover 3 zone with Kaden Elliss and Troy Andersen as active interior linebackers.",
        None,
        "Pittsburgh's 3-4 is legendary. T.J. Watt (99 OVR) is a perennial DPOY candidate off the right edge. Cameron Heyward (94 OVR) remains the best veteran DT in the league. Minkah Fitzpatrick (93 OVR) is a center-field safety with elite instincts. The Steelers run Cover 1 robber and zone blitz packages to maximize their talent.",
    ),
    "nyj-ten": (
        None,
        "Sauce Gardner (94 OVR) is the best pure corner in football and New York's defensive anchor. Quinnen Williams (88 OVR) is a dominant interior pass rusher at 3-tech. Haason Reddick provides pressure off the edge. C.J. Mosley and Quincy Williams patrol the middle in Cover 2 zone with Sauce locking down in press man.",
        None,
        "Tennessee's 4-3 is built around Jeffery Simmons (95 OVR) — the first-team All-Pro DT who broke the franchise sack record in 2025. L'Jarius Sneed (88 OVR) plays shadow corner. Azeez Al-Shaair is an instinctive ILB. Cover 3 zone with Amani Hooker as the run-support safety. Simple but effective.",
    ),
    "ari-lac": (
        None,
        "Arizona's 4-3 is built around Budda Baker (85 OVR) as the heartbeat safety who plays near the box. Josh Sweat (84 OVR) provides edge pressure from the SAM spot. Byron Murphy (82 OVR) plays the nickel with ball-hawk instincts. Cover 3 zone underneath with Budda as the single-high over the top.",
        None,
        "The Chargers' 3-4 is headlined by Khalil Mack (87 OVR) and Joey Bosa (83 OVR) as elite bookend OLBs — one of the most experienced edge tandems in the league. Derwin James (94 OVR) is an elite SS who plays near the line in an aggressive two-deep look. Cover 2 zone with James rotating into the box.",
    ),
    "mia-lv": (
        None,
        "Miami's 3-4 zone blitz scheme under Anthony Weaver generates confusion with multiple disguised pressures. Christian Wilkins (86 OVR) and Zach Sieler (83 OVR) form a dominant interior. Bradley Chubb (84 OVR) leads the edge rush. Jevon Holland (82 OVR) is a versatile box safety. Xavien Howard (84 OVR) handles the boundary corner in press.",
        None,
        "Las Vegas' 4-3 lives and dies with Maxx Crosby (97 OVR) — a generational pass rusher who demands a chip or double team every snap. Behind Crosby, the Raiders' defensive depth is thin. Cover 3 zone with Nate Hobbs in the slot. The scheme is straightforward: get Crosby home and hope for turnovers.",
    ),
    "gb-min": (
        None,
        "Green Bay's 4-3 pairs Rashan Gary (86 OVR) off the edge with Kenny Clark (88 OVR) as the space-eating NT. Jaire Alexander (90 OVR) plays aggressive press-man on the boundary. De'Vondre Campbell steadies the inside linebacker corps. Cover 3 zone with Keisean Nixon as the versatile nickel defender.",
        None,
        "Minnesota's 3-4 under Brian Flores is aggressive and multiple — zone blitzes disguised as Cover 2 to confuse QBs. Jonathan Allen (88 OVR) anchors the 0-tech NT. Andrew Van Ginkel (82 OVR) is the primary edge threat off the right OLB spot. Harrison Smith (88 OVR) is the veteran centerfield safety with elite football IQ.",
    ),
    "was-phi": (
        None,
        "Washington's 4-2-5 nickel base is built around Bobby Wagner (92 OVR) playing at SS/LB hybrid — a veteran presence who makes every defensive call. Da'Ron Payne (84 OVR) is the interior anchor. Odafe Oweh provides edge pressure. Emmanuel Forbes plays Cover 3 zone with two safeties splitting deep halves.",
        None,
        "Philadelphia's 3-4 is elite. Jalen Carter (89 OVR) is a force of nature at 1-tech. Zack Baun (88 OVR) breaks out as the do-everything ILB. Jonathan Greenard (85 OVR) and Nolan Smith pressure off the edges. Quinyon Mitchell (89 OVR) is a lockdown boundary corner. Cover 3 zone with deep safety help.",
    ),
    "dal-nyg": (
        None,
        "Dallas' 3-4 features Quinnen Williams (90 OVR) as the premier interior disruptor — a 3-tech who can win one-on-one. Rashan Gary (82 OVR) provides edge pressure off the SAM OLB spot. DaRon Bland (87 OVR) is a ball-hawk corner. Cover 3 zone with Jayron Kearse as the box safety.",
        None,
        "New York's 3-4 rebuilt around Dexter Lawrence (97 OVR) — the best NT in football who is virtually unblockable at the point of attack. Abdul Carter is the explosive edge prospect who disrupts as a rookie OLB. Brian Burns (89 OVR) rounds out a formidable front. Kayvon Thibodeaux provides contain. Cover 3 zone with safeties Tyler Nubin and Cordale Flott.",
    ),
    "den-kc": (
        None,
        "Denver's 3-4 is headlined by Pat Surtain II (97 OVR) — arguably the best corner in football, taking away an entire half of the field. Nik Bonitto (91 OVR) is a high-motor edge rusher off the left side. Zach Allen (87 OVR) anchors the interior. Talanoa Hufanga (86 OVR) is the single-high safety. Cover 3 zone with Surtain in press on the opponent's top WR.",
        None,
        "Kansas City's 4-2-5 nickel plays physical Cover 1 man, leaning on Chris Jones (97 OVR) as an unblockable interior force. Trent McDuffie (90 OVR) shadows receivers in press. George Karlaftis (82 OVR) and Felix Anudike-Uzomah provide edge pressure. Nick Bolton (83 OVR) is the quarterback of the defense. Aggressive, physical, championship-tested.",
    ),
}

SCHEME_PATTERN = re.compile(r'    defScheme: (".*?"),')

def inject_section(section, scheme_override, description):
    """Add defDescription (and optionally override defScheme) in one team section."""
    m = SCHEME_PATTERN.search(section)
    if not m:
        print("  WARNING: defScheme not found in section")
        return section

    original_line = m.group(0)

    if scheme_override is not None:
        new_scheme_line = f'    defScheme: "{scheme_override}",'
    else:
        new_scheme_line = original_line

    desc_escaped = description.replace("\\", "\\\\").replace('"', '\\"')
    desc_line = f'    defDescription: "{desc_escaped}",'

    replacement = new_scheme_line + "\n" + desc_line
    return section.replace(original_line, replacement, 1)


for filename, (away_scheme, away_desc, home_scheme, home_desc) in GAME_DESC.items():
    ts_path = os.path.join(DATA_DIR, f"{filename}.ts")
    with open(ts_path) as f:
        content = f.read()

    # Split at '  home: {' to get away-section and home-section
    SPLIT = "  home: {"
    if SPLIT not in content:
        print(f"SKIP {filename}.ts — cannot find '  home: {{'")
        continue

    idx = content.index(SPLIT)
    away_part = content[:idx]
    home_part = content[idx:]

    # Check if already injected
    if "defDescription" in away_part:
        print(f"  already done: {filename}.ts")
        continue

    away_part = inject_section(away_part, away_scheme, away_desc)
    home_part = inject_section(home_part, home_scheme, home_desc)

    with open(ts_path, "w") as f:
        f.write(away_part + home_part)

    print(f"  ✓ {filename}.ts")

print("\nDone.")
