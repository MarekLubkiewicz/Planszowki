export interface Game {
  game: string;
  votes?: number;
}

export interface Players {
  avatar: string;
  player: string;
}

export interface Event {
  id?: string; // Pole opcjonalne, ponieważ Firebase generuje ID automatycznie
  name: string;
  date: string;
  details?: string;
  slots: number;
  players?: Players [];// Lista zapisanych graczy
  games: Game[];
  chosen_game?: string;
  owner: string;
  place: string;
  time: string;
}