export interface TimerPlayer {
    name: string; 
    remainingTurnTime: number; 
    remainingGameTime: number; 
    stopwatchTime: number;
    turnOverruns: number; 
    isTurnActive: boolean;
}
