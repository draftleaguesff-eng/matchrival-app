import type { GameMatchupData } from "@/lib/matchup-types";
import { NE_SEA }              from "./ne-sea";
import { GAME_DATA as SF_LAR }  from "./sf-lar";
import { GAME_DATA as CHI_CAR } from "./chi-car";
import { GAME_DATA as TB_CIN }  from "./tb-cin";
import { GAME_DATA as NO_DET }  from "./no-det";
import { GAME_DATA as BUF_HOU } from "./buf-hou";
import { GAME_DATA as BAL_IND } from "./bal-ind";
import { GAME_DATA as CLE_JAX } from "./cle-jax";
import { GAME_DATA as ATL_PIT } from "./atl-pit";
import { GAME_DATA as NYJ_TEN } from "./nyj-ten";
import { GAME_DATA as ARI_LAC } from "./ari-lac";
import { GAME_DATA as MIA_LV }  from "./mia-lv";
import { GAME_DATA as GB_MIN }  from "./gb-min";
import { GAME_DATA as WAS_PHI } from "./was-phi";
import { GAME_DATA as DAL_NYG } from "./dal-nyg";
import { GAME_DATA as DEN_KC }  from "./den-kc";

// Order matches MATCHUP_GAMES array in src/app/matchup/page.tsx
export const ALL_GAMES: GameMatchupData[] = [
  NE_SEA,   // 0 — Wed Sep 9
  SF_LAR,   // 1 — Thu Sep 10
  CHI_CAR,  // 2 — Sun Sep 13 1pm
  TB_CIN,   // 3 — Sun Sep 13 1pm
  NO_DET,   // 4 — Sun Sep 13 1pm
  BUF_HOU,  // 5 — Sun Sep 13 1pm
  BAL_IND,  // 6 — Sun Sep 13 1pm
  CLE_JAX,  // 7 — Sun Sep 13 1pm
  ATL_PIT,  // 8 — Sun Sep 13 1pm
  NYJ_TEN,  // 9 — Sun Sep 13 1pm
  ARI_LAC,  // 10 — Sun Sep 13 4:25pm
  MIA_LV,   // 11 — Sun Sep 13 4:25pm
  GB_MIN,   // 12 — Sun Sep 13 4:25pm
  WAS_PHI,  // 13 — Sun Sep 13 4:25pm
  DAL_NYG,  // 14 — Sun Sep 13 8:20pm
  DEN_KC,   // 15 — Mon Sep 14
];
