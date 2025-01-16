import { Component, OnInit } from '@angular/core';
import { IonicModule, ViewWillEnter, } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { Router } from '@angular/router';


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
    next: () => {
      this.router.navigate(['/logowanie']);
    },
    error: (err) => {
      console.error('Rejestracja nieudana', err);
      alert('Nazwa zajęta.');
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

}
