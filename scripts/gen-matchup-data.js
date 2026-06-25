#!/usr/bin/env node
"use strict";

const fs   = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../public/week1-rosters.json");
const OUT_DIR   = path.join(__dirname, "../src/lib/matchup-data");

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));

// ESPN uses "wsh" not "was" for Washington
const ESPN_ABBR_OVERRIDE = { WAS: "wsh" };

function logoUrl(abbr) {
  const slug = ESPN_ABBR_OVERRIDE[abbr] ?? abbr.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${slug}.png`;
}

// "Josh Allen" → "J. Allen", "Amon-Ra St. Brown" → "A. St. Brown"
function toDisplay(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

function posToTypes(pos, isSlot) {
  if (isSlot) return { ringType: "wr", badgeType: "slot", badgeLabel: "SLOT" };
  const map = {
    QB:  { ringType: "qb",  badgeType: "qb"  },
    RB:  { ringType: "rb",  badgeType: "rb"  },
    WR:  { ringType: "wr",  badgeType: "wr"  },
    TE:  { ringType: "te",  badgeType: "te"  },
    LT:  { ringType: "ol",  badgeType: "ol"  },
    LG:  { ringType: "ol",  badgeType: "ol"  },
    C:   { ringType: "ol",  badgeType: "ol"  },
    RG:  { ringType: "ol",  badgeType: "ol"  },
    RT:  { ringType: "ol",  badgeType: "ol"  },
    DE:  { ringType: "de",  badgeType: "de"  },
    DT:  { ringType: "dt",  badgeType: "dt"  },
    NT:  { ringType: "nt",  badgeType: "nt"  },
    OLB: { ringType: "lb",  badgeType: "lb"  },
    ILB: { ringType: "lb",  badgeType: "lb"  },
    CB:  { ringType: "cb",  badgeType: "cb"  },
    SS:  { ringType: "ss",  badgeType: "ss"  },
    FS:  { ringType: "fs",  badgeType: "fs"  },
    NB:  { ringType: "nb",  badgeType: "nb"  },
  };
  return { ...(map[pos] ?? { ringType: "wr", badgeType: "wr" }), badgeLabel: pos };
}

function convertPlayer(p, posKey) {
  const isSlot = posKey === "SLOT";
  const isOL   = ["LT", "LG", "C", "RG", "RT"].includes(posKey);
  const types  = posToTypes(p.pos, isSlot);
  const nameBold = p.pos === "QB" || p.rating >= 90;

  const fields = [
    `display: ${JSON.stringify(toDisplay(p.name))}`,
    `initials: ${JSON.stringify(p.initials)}`,
    `ringType: ${JSON.stringify(types.ringType)}`,
    `badgeType: ${JSON.stringify(types.badgeType)}`,
    `badgeLabel: ${JSON.stringify(types.badgeLabel)}`,
    `rating: ${p.rating}`,
  ];
  if (isOL)     fields.push("maxWidth: 36");
  if (nameBold) fields.push("nameBold: true");
  return `{ ${fields.join(", ")} }`;
}

function genTeam(team) {
  const o = team.offense;
  const d = team.defense;
  return `{
    name: ${JSON.stringify(team.name)},
    abbr: ${JSON.stringify(team.abbr)},
    color: ${JSON.stringify(team.color)},
    logo: ${JSON.stringify(logoUrl(team.abbr))},
    formation: ${JSON.stringify(team.formation)},
    personnel: "11 Personnel",
    defFormation: ${JSON.stringify(team.defFormation)},
    defScheme: ${JSON.stringify(team.defScheme)},
    offense: {
      WR_LEFT:  ${convertPlayer(o.WR_LEFT,  "WR_LEFT")},
      LT:       ${convertPlayer(o.LT,       "LT")},
      LG:       ${convertPlayer(o.LG,       "LG")},
      C:        ${convertPlayer(o.C,        "C")},
      RG:       ${convertPlayer(o.RG,       "RG")},
      RT:       ${convertPlayer(o.RT,       "RT")},
      TE:       ${convertPlayer(o.TE,       "TE")},
      SLOT:     ${convertPlayer(o.SLOT,     "SLOT")},
      WR_RIGHT: ${convertPlayer(o.WR_RIGHT, "WR_RIGHT")},
      QB:       ${convertPlayer(o.QB,       "QB")},
      RB:       ${convertPlayer(o.RB,       "RB")},
    },
    defense: {
      CB_LEFT: ${convertPlayer(d.CB_LEFT, "CB_LEFT")},
      SS:      ${convertPlayer(d.SS,      "SS")},
      FS:      ${convertPlayer(d.FS,      "FS")},
      NB:      ${convertPlayer(d.NB,      "NB")},
      OLB_L:   ${convertPlayer(d.OLB_L,  "OLB_L")},
      ILB_L:   ${convertPlayer(d.ILB_L,  "ILB_L")},
      ILB_R:   ${convertPlayer(d.ILB_R,  "ILB_R")},
      OLB_R:   ${convertPlayer(d.OLB_R,  "OLB_R")},
      DE_L:    ${convertPlayer(d.DE_L,   "DE_L")},
      NT:      ${convertPlayer(d.NT,     "NT")},
      DE_R:    ${convertPlayer(d.DE_R,   "DE_R")},
    },
  }`;
}

const KEY_TO_FILENAME = {
  SF_LAR:  "sf-lar",
  CHI_CAR: "chi-car",
  TB_CIN:  "tb-cin",
  NO_DET:  "no-det",
  BUF_HOU: "buf-hou",
  BAL_IND: "bal-ind",
  CLE_JAX: "cle-jax",
  ATL_PIT: "atl-pit",
  NYJ_TEN: "nyj-ten",
  ARI_LAC: "ari-lac",
  MIA_LV:  "mia-lv",
  GB_MIN:  "gb-min",
  WAS_PHI: "was-phi",
  DAL_NYG: "dal-nyg",
  DEN_KC:  "den-kc",
};

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

for (const [key, filename] of Object.entries(KEY_TO_FILENAME)) {
  const game = data[key];
  if (!game) { console.warn(`Missing key: ${key}`); continue; }

  const content = `import type { GameMatchupData } from "@/lib/matchup-types";

export const GAME_DATA: GameMatchupData = {
  id: ${JSON.stringify(filename)},
  away: ${genTeam(game.away)},
  home: ${genTeam(game.home)},
};
`;

  fs.writeFileSync(path.join(OUT_DIR, `${filename}.ts`), content, "utf-8");
  console.log(`✓ ${filename}.ts`);
}

console.log(`\nDone! Generated ${Object.keys(KEY_TO_FILENAME).length} files.`);
