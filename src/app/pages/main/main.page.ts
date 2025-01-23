import { Component, OnInit } from '@angular/core';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: false,
})
export class MainPage implements OnInit {

  public eventsPages = [
    { title: 'Wszystkie spotkania', url: '/main/events/all-events', icon: 'calendar'},
    { title: 'Twoje spotkania', url: '/main/events/tabs', icon: 'push'},
  ];

  public gamesPages = [
    { title: 'Baza gier', url: '/main/games/game-info', icon: 'game-controller'},
    { title: 'Rozgrywka', url: '/main/games/tools', icon: 'dice'},
  ];

  public otherPages = [
    { title: 'Użytkownik', url: '/main/other/profile', icon: 'person'},
    { title: 'O aplikacji', url: '/main/other/about', icon: 'map'},
    { title: 'Ustawienia', url: '/main/other/settings', icon: 'settings'},
  ];

  zalogowany = false;
  uzytkownik_id: number | null = null;
  uzytkownik: string | null = null;

  constructor(
    private autentykacja: AutentykacjaService, 
    private router: Router
  ) { }

  ngOnInit() {
  }

  wyloguj() {
    this.autentykacja.wylogowanie().subscribe({
      next: (response) => {
        console.log('Wylogowano pomyślnie');
        this.zalogowany = false;
        this.uzytkownik_id = null;
        this.uzytkownik = null;
        this.router.navigate(['/home']);
        alert(response.komunikat)
      },
      error: (error) => {
        console.error('Błąd podczas wylogowywania:', error);
      }
    });
  }

  isActive(url: string): boolean {
    const isActive = this.router.url.startsWith(url);
    console.log(`URL: ${this.router.url}, Checking: ${url}, Active: ${isActive}`);
    return isActive;
  }

}
