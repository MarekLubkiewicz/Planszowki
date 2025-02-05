import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { ViewWillEnter } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';


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


  constructor(
    private router: Router,
    private autentykacja: AutentykacjaService,
    private alertService: AlertService
  ) { }

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
      error: (error) => {
        alert(`Brak połączenia z serwerem. ${error.statusText}`);
        return;
      },
    });
  }

  zalogujUzytkownika() {
    if (!this.nazwa) {
      alert("Podaj nazwę użytkownika")
      return;
    } else if (!this.haslo) {
        alert("Podaj hasło")
        return;
    } 
    this.autentykacja.logowanie(this.nazwa, this.haslo).subscribe({
        next: (response) => {
          this.alertService.showAlert(
            'Sukces',
            response.komunikat,
            'alert-success'
          );
          this.router.navigate(['/main']); // Po zalogowaniu przejście na stronę główną
      },
      error: (err) => {
        console.error(`Logowanie nieudane ${err.status}`);
        if (err.error && err.error.blad) {
          alert(err.error.blad);
        } else if (err.message) {
          alert(`Błąd: ${err.message}`);
        } else {
          alert(`Wystąpił błąd podczas logowania. Kod błędu: ${err.status} ${err.statusText}`);
        }
      },
    });
  }

  rejestracja() {
    this.router.navigate(['/rejestracja']);
  }

  zapomnialem() {
    this.router.navigate(['/resetowanie-hasla']);
  }
}
