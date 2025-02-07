import { Component, OnInit } from '@angular/core';
import { ViewWillEnter, } from '@ionic/angular';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-rejestracja',
  templateUrl: './rejestracja.page.html',
  styleUrls: ['./rejestracja.page.scss'],
  standalone: false,  
})
export class RejestracjaPage implements OnInit, ViewWillEnter {

  nazwa: string = '';
  email: string = '';
  haslo: string = '';
  potwierdzenie: string = '';
  zalogowany = false;
  uzytkownik_id: number | null = null;
  uzytkownik: string | null = null;
  showPassword: boolean = false;


  constructor(
    private uzytkownikDane: AutentykacjaService, 
    private router: Router
  ) { }

  ngOnInit() { 
    this.weryfikujSesje();
  }

  ionViewWillEnter() {
    this.weryfikujSesje();
  }

  zarejestrujUzytkownika() {
    if (!this.nazwa) {
      alert('Podaj nazwę użytkownika, jakiej chcesz używać');
      return;
    } else if (!this.email) {
      alert("Podaj e-mail.");
      return;
    } else if (!this.czyEmailPoprawny(this.email)) {
      alert("Podaj poprawny e-mail");
      return
    } else if (!this.haslo) {
      alert("Podaj poprawne hasło.");
      return;
    } else if ((this.haslo != this.potwierdzenie)) {
      alert("Podaj poprawne hasło dwukrotnie.");
      return;
    } else if (!this.walidujHaslo(this.haslo)) {
      alert("Hasło musi mieć co najmniej 8 znaków, zawierać wielką literę, małą literę, cyfrę i znak specjalny.");
      return;
    }
        
  this.uzytkownikDane.rejestruj(this.nazwa, this.haslo, this.email).subscribe({
    next: (response) => {
      Swal.fire('Brawo', response.komunikat, 'success');
      this.router.navigate(['/logowanie']);
    },
    error: (err) => {
      console.error(`Logowanie nieudane ${err.status}`);
      if (err.error && err.error.blad) {
        alert(err.error.blad);
      } else if (err.message) {
        alert(`Błąd: ${err.message}`);
      } else {
        alert(`Wystąpił błąd podczas rejestracji. Kod błędu: ${err.status} ${err.statusText}`);
      }
    },
  })
  }

  czyEmailPoprawny(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  walidujHaslo(haslo: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(haslo);
  }

  weryfikujSesje() {
    this.uzytkownikDane.sprawdzSesje().subscribe({
      next: (response) => {
        this.zalogowany = response.zalogowany;
        this.uzytkownik_id = response.uzytkownik_id;
        this.uzytkownik = response.uzytkownik;
      },
    });
  }

  logowanie() {
    this.router.navigate(['/logowanie']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

}
