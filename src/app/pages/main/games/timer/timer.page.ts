import { Component } from '@angular/core';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-timer',
  templateUrl: './timer.page.html',
  styleUrls: ['./timer.page.scss'],
  standalone: false,
})
export class TimerPage {
  newPlayerName: string = '';
  players: { 
    name: string; 
    remainingTurnTime: number; 
    remainingGameTime: number; 
    stopwatchTime: number; 
    isTurnActive: boolean 
  }[] = [];
  currentPlayerIndex: number | null = null;
  turnInterval: any;
  stopwatchInterval: any;
  isGameRunning: boolean = false;
  isPaused: boolean = false;
  isAlertDisplayed: boolean = false;

  countdownTurnEnabled: boolean = true;
  countdownGameEnabled: boolean = true;
  stopwatchEnabled: boolean = false;

  initialTurnTime: number = 60;
  initialGameTime: number = 600;
  gameTimeInput: number = 10;
  turnTimeInput: number = 60;
  progress = 0;

  constructor() {}

  addPlayer() {
    if (this.newPlayerName.trim()) {
      this.players.push({
        name: this.newPlayerName,
        remainingTurnTime: this.initialTurnTime,
        remainingGameTime: this.initialGameTime,
        stopwatchTime: 0,
        isTurnActive: false,
      });
      this.newPlayerName = '';
    }
  }

  removePlayer(index: number) {
    this.players.splice(index, 1);
    // Jeżeli usunięto aktualnego gracza, resetujemy stan gry
    if (this.currentPlayerIndex === index) {
      this.currentPlayerIndex = null;
      this.isGameRunning = false;
      clearInterval(this.turnInterval);
      clearInterval(this.stopwatchInterval);
    } else if (this.currentPlayerIndex !== null && index < this.currentPlayerIndex) {
      // Jeżeli usunięto gracza przed aktualnym graczem, zmniejszamy indeks
      this.currentPlayerIndex--;
    }
  }

  applyTimeSettings() {
    if (this.gameTimeInput > 0 && this.turnTimeInput > 0) {
      this.initialGameTime = this.gameTimeInput * 60;
      this.initialTurnTime = this.turnTimeInput;
      this.players.forEach((player) => {
        player.remainingTurnTime = this.initialTurnTime;
        player.remainingGameTime = this.initialGameTime;
      });
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  startGame() {
    if (!this.isGameRunning && this.players.length > 0) {
      this.isGameRunning = true;
      this.isPaused = false;
      this.currentPlayerIndex = 0;
      this.startTurn(this.currentPlayerIndex);
    }
  }

  pauseGame() {
    if (this.isGameRunning) {
      clearInterval(this.turnInterval);
      clearInterval(this.stopwatchInterval);
      this.isGameRunning = false;
      this.isPaused = true;
    }
  }

  resumeGame() {
    if (this.isPaused && this.currentPlayerIndex !== null) {
      this.isPaused = false;
      this.isGameRunning = true;
      this.startTurn(this.currentPlayerIndex);
    }
  }

  resetGame() {
    clearInterval(this.turnInterval);
    clearInterval(this.stopwatchInterval);
    this.isGameRunning = false;
    this.isPaused = false;
    this.currentPlayerIndex = null;
    this.players.forEach((player) => {
      player.remainingTurnTime = this.initialTurnTime;
      player.remainingGameTime = this.initialGameTime;
      player.stopwatchTime = 0;
      player.isTurnActive = false;
    });
  }

  nextTurn() {
    if (this.turnInterval) {
      clearInterval(this.turnInterval);
    }
    if (this.stopwatchInterval) {
      clearInterval(this.stopwatchInterval);
    }

    if (this.currentPlayerIndex !== null) {
      this.players[this.currentPlayerIndex].isTurnActive = false;
      // Reset czasu tury dla bieżącego gracza
      this.players[this.currentPlayerIndex].remainingTurnTime = this.initialTurnTime;
    }

    // Przejście do następnego gracza
    this.currentPlayerIndex = this.currentPlayerIndex === null ? 0 : (this.currentPlayerIndex + 1) % this.players.length;
    this.startTurn(this.currentPlayerIndex);
  }

  startTurn(playerIndex: number) {
    const currentPlayer = this.players[playerIndex];
    currentPlayer.isTurnActive = true;
    this.isAlertDisplayed = false;

    // Jeden interwał zarządza oboma licznikami
    this.turnInterval = setInterval(() => {
      if (this.countdownTurnEnabled && currentPlayer.remainingTurnTime > 0) {
        currentPlayer.remainingTurnTime--;
      }

      if (this.countdownGameEnabled && currentPlayer.remainingGameTime > 0) {
        currentPlayer.remainingGameTime--;
      }

      // Zakończenie tury, gdy czas tury się skończy
      if ((currentPlayer.remainingTurnTime === 0 || currentPlayer.remainingGameTime === 0) && !this.isAlertDisplayed) {
          this.isAlertDisplayed = true; // Ustawienie flagi, aby uniknąć wielu alertów
          clearInterval(this.turnInterval); // Zatrzymanie odliczania
          Swal.fire({
            title: "UWAGA",
            text: `Czas tury dla gracza ${currentPlayer.name} dobiegł końca.`,
            icon: "warning",
            color: " #800000",
            background: "#FFE4E1",
            confirmButtonColor: " #800000",
          }).then((result) => {
            if (result.isConfirmed) {
              this.isAlertDisplayed = false;
              this.nextTurn(); // Przejście do kolejnej tury po zamknięciu alertu
            }
          });
        }
      }, 1000);

    if (this.stopwatchEnabled) {
      this.stopwatchInterval = setInterval(() => {
        currentPlayer.stopwatchTime++;
      }, 1000);
    }
  }
}

