import { Component, OnInit } from '@angular/core';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { Router } from '@angular/router'
import { ViewWillEnter } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, ViewWillEnter {

  zalogowany = false;

  constructor(
    private autentykacja: AutentykacjaService, 
    private router: Router
  ) {}

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
        if (this.zalogowany) {
          this.router.navigate(['/main']); // Przekierowanie do 'main' w przypadku aktywnej sesji
        }
      }, 
      error: () => {
        this.router.navigate(['/home']);
      },
    });
  }

  logowanie() {
    this.router.navigate(['/logowanie']);
  }
  rejestracja() {
    this.router.navigate(['/rejestracja']);
  }

}
