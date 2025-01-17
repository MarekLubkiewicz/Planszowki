export interface Game {
  game: string;
  votes?: string[];
}

export interface Event {
  id?: string; // Pole opcjonalne, ponieważ Firebase generuje ID automatycznie
  name: string;
  date: string;
  details?: string;
  slots: number;
  players?: string[]; // Lista zapisanych graczy
  games: Game[];
  owner: string;
  place: string;
  time: string;
}