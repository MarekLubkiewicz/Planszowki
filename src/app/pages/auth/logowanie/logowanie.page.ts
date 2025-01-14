import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-logowanie',
  templateUrl: './logowanie.page.html',
  styleUrls: ['./logowanie.page.scss'],
  standalone: false,
})

export class LogowaniePage implements OnInit, ViewWillEnter {

  nazwa: string = "";
  haslo: string = "";
  zalogowany = false;
  uzytkownik: string | null = null;


  constructor(private router: Router, private autentykacja: AutentykacjaService) { }

  ngOnInit() { 
    this.weryfikujSesje();
  }

  ionViewWillEnter() {
    this.weryfikujSesje();
  }

  weryfikujSesje() {
    this.autentykacja.sprawdzSesje().subscribe({
      next: (response) => {
        this.zalogowany = response.zalogowany;
        this.uzytkownik = response.uzytkownik;
        if (this.zalogowany) {
          this.router.navigate(['/main']); // Przekierowanie do 'main' w przypadku aktywnej sesji
        }
      },
      error: () => {
        this.router.navigate(['/logowanie']); // Przekierowanie do logowania
      },
    });
  }

  zalogujUzytkownika() {
    if (!this.nazwa) {
      alert("Podaj nazwę użytkownika")
      return;
    } else if (!this.haslo) {
        alert("Podaj nazwę użytkownika")
        return;
    } 
    this.autentykacja.logowanie(this.nazwa, this.haslo).subscribe({
        next: () => {
          this.router.navigate(['/main']); // Po zalogowaniu przejście na stronę główną
      },
      error: (err) => {
        console.error(`Logowanie nieudane ${err.status}`);
        alert('Niepoprawne dane logowania.');
      },
    });
  }

  rejestracja() {
    this.router.navigate(['/rejestracja']);
  }
}
