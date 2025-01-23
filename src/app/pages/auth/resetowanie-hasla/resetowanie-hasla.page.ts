import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-resetowanie-hasla',
  templateUrl: './resetowanie-hasla.page.html',
  styleUrls: ['./resetowanie-hasla.page.scss'],
  standalone: false,
})
export class ResetowanieHaslaPage implements OnInit {

  email: string = "";
  kodWyslany: boolean = false;
  kodRes: string = '';
  noweHaslo: string = '';
  potwierdzenieHaslo: string = '';
  
  nazwa: string = "";
  nowe_haslo: string = "";
  zalogowany = false;
  uzytkownik: string | null = null;

  constructor(private router: Router, private autentykacja: AutentykacjaService) { }

  ngOnInit() {
    this.weryfikujSesje();
  }

  ionViewWillEnter() {
    this.kodWyslany = false;
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

  logowanie() {
    this.router.navigate(['/logowanie']);
  }

  wyslijDoMnieKod() {
    if (!this.email) {
      alert("Wprowadź email, który podałeś/aś przy rejestracji")
      return;
    }
    this.autentykacja.wyslijKod(this.email).subscribe({
      next: (response) => {
        this.kodWyslany = true;
        alert(response.komunikat);
        return;
      },
      error: (err) => {
        console.error('Błąd przy wysyłaniu kodu', err);
        if (err.error && err.error.blad) {
          alert(err.error.blad);
        } else if (err.message) {
          alert(`Błąd: ${err.message}`);
        } else {
          alert(`Wystąpił błąd podczas wysyłania kodu. Kod błędu: ${err.status} ${err.statusText}`);
        }
      },
    })
  }


  resetujHaslo() {
    if (!this.kodRes) {
      alert('Podaj kod uwierzytleniający');
      return;
    } else if (!this.noweHaslo) {
      alert("Podaj poprawne hasło.");
      return;
    } else if ((this.noweHaslo != this.potwierdzenieHaslo)) {
      alert("Podaj poprawne hasło dwukrotnie.");
      return;
    } else if (!this.walidujHaslo(this.noweHaslo)) {
      alert("Hasło musi mieć co najmniej 8 znaków, zawierać wielką literę, małą literę, cyfrę i znak specjalny.");
      return;
    }

    this.autentykacja.resetujMojehaslo(this.noweHaslo, this.kodRes, this.email).subscribe({
      next: (response) => {
        alert(response.komunikat);
        this.router.navigate(['/logowanie']);
      },
      error: (err) => {
        console.error('Błąd przy próbie zmiany hasła', err);
        if (err.error && err.error.blad) {
          alert(err.error.blad);
        } else if (err.message) {
          alert(`Błąd: ${err.message}`);
        } else {
          alert(`Wystąpił błąd próby zmiany hasła. Kod błędu: ${err.status} ${err.statusText}`);
        }
      },
    })
  }


  walidujHaslo(haslo: string): boolean {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(haslo);
  }
}
