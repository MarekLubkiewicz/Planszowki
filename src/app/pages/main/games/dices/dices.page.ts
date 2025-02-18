import { Component } from '@angular/core';

@Component({
  selector: 'app-dices',
  templateUrl: './dices.page.html',
  styleUrls: ['./dices.page.scss'],
  standalone: false,
})
export class DicesPage {
  isRolling: boolean = false;
  diceCount: number = 0;
  diceArray: { rotationStyle: string }[] = [];
  allDiceArray: { value: number; type: string }[] = [];

  constructor() { }


  updateDiceArrayK6(event: any) {
    this.diceArray = Array.from({ length: event.detail.value }, () => ({ rotationStyle: '' }));
  }

  rollDiceK6() {
    
    this.diceArray = this.diceArray.map(() => {
      let zRotation = (Math.random() * 40) - 20;
      let xRotation = Math.floor(Math.random() * 4) * 90;
      let yRotation =  Math.floor(Math.random() * 4) * 90;
      
      return {
        rotationStyle: `rotateZ(${zRotation}deg) rotateX(${xRotation}deg) rotateY(${yRotation}deg)`,
      };
    });

  }


  // Aktualizacja liczby kostek dla danego typu
  updateDiceArray(type: string, event: any) {
    const count = event?.detail?.value || 0;
    // Usuwamy istniejące kostki tego typu z `allDiceArray`
    this.allDiceArray = this.allDiceArray.filter(dice => dice.type !== type);

    // Dodajemy nowe kostki danego typu
    const newDiceArray = Array.from({ length: count }, () => ({
      value: Math.floor(Math.random() * this.getMaxValue(type)) + 1,
      type: type
    }));

    this.allDiceArray.push(...newDiceArray);
  }

  // Funkcja pomocnicza do określenia maksymalnej liczby oczek dla danego typu kostki
  private getMaxValue(type: string): number {
    switch (type) {
      case 'K4': return 4;
      case 'K8': return 8;
      case 'K10': return 10;
      case 'K12': return 12;
      case 'K20': return 20;
      default: return 4;
    }
  }

  // Rzut wszystkimi kostkami
  rollAllDices() {
    if (this.isRolling) return;

    this.isRolling = true;
    this.allDiceArray = this.allDiceArray.map(dice => ({
      ...dice,
      value: Math.floor(Math.random() * this.getMaxValue(dice.type)) + 1
    }));
    this.rollDiceK6();

    setTimeout(() => {
      this.isRolling = false;
    }, 1000);
  }

}
