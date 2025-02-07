import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { ViewWillEnter } from '@ionic/angular';
import Swal from 'sweetalert2';


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
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private autentykacja: AutentykacjaService,
  ) { }

  ngOnInit() { 
    this.weryfikujSesje();
  }

  ionViewWillEnter() {
    this.weryfikujSesje();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
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
        Swal.fire('Błąd!',`Brak połączenia z serweremm. ${error.statusText}`, 'error');
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
        next: () => {
          Swal.fire({
            title: 'Sukces',
            text: `Zalogowałeś się jako ${this.nazwa}`,
            icon: 'success',
            timer: 3000,
            confirmButtonText: 'OK'
          });
          this.router.navigate(['/main']); // Po zalogowaniu przejście na stronę główną
      },
      error: (err) => {
         console.error(`Logowanie nieudane ${err.status}`);
         Swal.fire({
            title: 'Logowanie nieudane',
            text: `Wystąpił błąd podczas logowania: ${err.error.blad}`,
            icon: 'error',
            confirmButtonText: 'OK'
          });
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
