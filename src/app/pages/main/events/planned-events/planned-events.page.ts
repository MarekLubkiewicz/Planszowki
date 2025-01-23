import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Event } from 'src/app/models/events';

@Component({
  selector: 'app-planned-events',
  templateUrl: './planned-events.page.html',
  styleUrls: ['./planned-events.page.scss'],
  standalone: false,
})
export class PlannedEventsPage implements OnInit {
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
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || ''; //
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
      this.avatar = user.avatar;
    });
    this.loadMyEvents();
  }

  loadMyEvents() {
    this.isLoading = true;
    this.databaseService.getMyEvents(this.currentUser).subscribe({
      next: (data) => {
         this.myEvents = data.map((event) => ({
          ...event,
          games: event.games || [],
          registeredPlayers: event.players?.length || 0, // Dynamiczne obliczanie liczby graczy
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania wydarzeń:', err);
        this.isLoading = false;
        this.myEvents = []; // Wyczyść listę w przypadku błędu
      },
    });
  }

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
