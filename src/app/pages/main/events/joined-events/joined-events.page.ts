import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Event } from 'src/app/models/events';

@Component({
  selector: 'app-joined-events',
  templateUrl: './joined-events.page.html',
  styleUrls: ['./joined-events.page.scss'],
  standalone: false,
})
export class JoinedEventsPage implements OnInit {
  public title!: string;
  currentUser: string = '';
  log_in: boolean = false;
  avatar: string = '';
  isLoading = false;
  myEvents: Event[] = [];
  eventsJoin: Event[] = [];
  isModalOpen = false; // Kontroluje stan modalu wyświetlającego zapisanych graczy
  currentPlayers: string[] = []; // Przechowuje listę graczy dla wybranego wydarzenia
  

  constructor(
    private activatedRoute: ActivatedRoute,
    private autentykacjaService: AutentykacjaService,
    private databaseService: DatabaseService, 
  ) { }

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || '';
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
      this.avatar = user.avatar;
    });
    this.loadMyJoinEvents();
  }

  loadMyJoinEvents() {
    this.isLoading = true;
    this.databaseService.getMyJoinEvents(this.currentUser).subscribe({
      next: (data) => {
         this.eventsJoin = data.map((event) => ({
          ...event,
          games: event.games || [],
          registeredPlayers: event.players?.length || 0, // Dynamiczne obliczanie liczby graczy
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania wydarzeń:', err);
        this.isLoading = false;
        this.eventsJoin = []; // Wyczyść listę w przypadku błędu
      },
    });
  }

  /*
  removeFromEvent(event: Event) {
    const currentPlayer = this.currentUser; // Nazwa zalogowanego gracza
    const gameIndex = event.games.findIndex((game) => game.votes?.includes(currentPlayer));
    const gameKey = gameIndex.toString();

    if (!event.id || !gameKey || !currentPlayer) {
      console.error('Brak wymaganych danych do rezygnacji z wydarzenia.');
      return;
    }

    this.databaseService.removePlayerFromEvent(event.id, currentPlayer, gameKey).subscribe({
      next: () => {
        // Aktualizacja lokalnej listy wydarzeń
        this.eventsJoin = this.eventsJoin.filter((e) => e.id !== event.id);
        console.log('Gracz został wypisany z wydarzenia.');
      },
      error: (error) => {
        console.error('Błąd podczas rezygnacji z wydarzenia:', error);
      },
    });
  }
    */


  // modal do wyświetlenia zapisanych graczy
  viewPlayers(players: string[]) {
    this.currentPlayers = players; // Przypisz listę graczy
    this.isModalOpen = true; // Otwórz modal
  }

  closeModal() {
    this.isModalOpen = false; // Zamknij modal
    this.currentPlayers = []; // Wyczyść listę graczy
  }
  

}
