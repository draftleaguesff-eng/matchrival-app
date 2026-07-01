export interface MatchupPlayer {
  display: string;
  initials: string;
  ringType: string;
  badgeType: string;
  badgeLabel: string;
  headshot?: string;
  size?: number;
  maxWidth?: number;
  nameBold?: boolean;
  rating?: number;
  cardKey?: string;
}

export interface TeamMatchupData {
  name: string;
  abbr: string;
  color: string;
  logo: string;
  formation: string;
  personnel: string;
  defFormation: string;
  defScheme: string;
  defDescription: string;
  offense: {
    WR_LEFT: MatchupPlayer;
    LT: MatchupPlayer;
    LG: MatchupPlayer;
    C: MatchupPlayer;
    RG: MatchupPlayer;
    RT: MatchupPlayer;
    TE: MatchupPlayer;
    SLOT: MatchupPlayer;
    WR_RIGHT: MatchupPlayer;
    QB: MatchupPlayer;
    RB: MatchupPlayer;
  };
  defense: {
    CB_LEFT: MatchupPlayer;
    SS: MatchupPlayer;
    FS: MatchupPlayer;
    NB: MatchupPlayer;
    OLB_L: MatchupPlayer;
    ILB_L: MatchupPlayer;
    ILB_R: MatchupPlayer;
    OLB_R: MatchupPlayer;
    DE_L: MatchupPlayer;
    NT: MatchupPlayer;
    DE_R: MatchupPlayer;
  };
}

export interface MatchupGrade {
  label: string;
  awayGrade: string;
  homeGrade: string;
  note: string;
}

export interface MatchupSummaryData {
  grades: MatchupGrade[];
  verdict: string;
}

export interface GameMatchupData {
  id: string;
  away: TeamMatchupData;
  home: TeamMatchupData;
  matchupSummary?: MatchupSummaryData;
}
