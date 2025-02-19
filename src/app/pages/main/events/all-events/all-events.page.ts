import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { Event, Game, Players } from 'src/app/models/events';
import { format } from 'date-fns';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { EventService } from 'src/app/services/event.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-all-events',
  templateUrl: './all-events.page.html',
  styleUrls: ['./all-events.page.scss'],
  standalone: false,
})

export class AllEventsPage implements OnInit {
  public title!: string;
  events: Event[] = [];
  filteredEvents: Event[] = [];
  filter = {
    place:'',
    name: '',
    date: '',
    game: '',
    favorites: false,
  }
  isLoading = false;
  isModalOpen = false; // Kontroluje stan modalu wyświetlającego zapisanych graczy
  currentPlayers: Players[] = []; // Przechowuje listę graczy dla wybranego wydarzenia
  isDateFilterModalOpen = false; // Kontroluje stan modalu filtrowania po dacie
  log_in = false;
  currentUser: string = '';
  ulubione: string[] = [];
  avatar: string = '';
  defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService, 
    private autentykacjaService: AutentykacjaService,
    private eventService: EventService,
    ) { }

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || 'Wszystkie spotkania';
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
      this.avatar = user.avatar;
      this.ulubione = user.ulubione;
    });
    this.loadEvents();
  }

  loadEvents() {
    this.isLoading = true;
    this.databaseService.getAllEvents().subscribe({
      next: (data) => {
         this.events = data.map((event) => ({
          ...event,
          games: event.games || [], // do ewentualnego usunięcia - 
          registeredPlayers: event.players?.length ?? 0, // Dynamiczne obliczanie liczby graczy
        }));
        this.filteredEvents = [...this.events];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Błąd podczas pobierania wydarzeń:', err);
        this.isLoading = false;
        this.events = []; // Wyczyść listę w przypadku błędu
      },
    });
  }

  applyFilters() {
    if (this.filter.favorites && (!this.ulubione || this.ulubione.length === 0)) {
    Swal.fire({
      title: 'Brak ulubionych gier',
      text: 'Nie dodałeś jeszcze żadnych ulubionych gier. Dodaj gry, aby móc filtrować po ulubionych.',
      icon: 'info',
      confirmButtonText: 'OK'
    }).then(() => {
      this.filter.favorites = false; // Automatyczne odznaczenie checkboxa
    });
    return; // Zatrzymujemy dalsze filtrowanie
  }
    this.filteredEvents = this.events.filter((event) => {
      const matchesPlace = 
        this.filter.place === '' || event.place.toLowerCase().includes(this.filter.place.toLowerCase());
      const matchesName = 
        this.filter.name === '' || event.name.toLowerCase().includes(this.filter.name.toLowerCase());
      const matchesDate =
        !this.filter.date || format(new Date(this.filter.date), 'dd.MM.yyyy') === event.date;
      const matchesGames =
        this.filter.game === '' || event.games.some(game => game.game.toLowerCase().includes(this.filter.game.toLowerCase()));
      const matchesFavorites =
        !this.filter.favorites || event.games.some(game => this.ulubione.some(ulubioneGame => ulubioneGame.toLowerCase() === game.game.toLowerCase()));
      return matchesPlace&&matchesName&&matchesDate&&matchesGames&&matchesFavorites;
    });
  }
  
  // Metoda pomocnicza, sprawdzająca czy obecny użytkownik jest organizatorem wydarzenia
  isEventOrganizer(owner: string): boolean {
    return this.currentUser === owner;
  }

  // Metoda,pomocnicza, sprawdzająca czy obecny użytkownik jest zapisany na wydarzenie
  isAlreadyJoined(players: Players[] | undefined) : boolean {
    return players ? players.some(playerObj => playerObj.player === this.currentUser) : false;
  }

  // Metoda pomocnicza, sprawdzająca czy nie jest przekroczony limit uczetników
  isEventFull(event: Event): boolean {
    return event.players ? event.players.length >= event.slots : false;
  }


  getDisabledReason(owner: string, players: Players[], slots: number): string {
    if (this.isEventOrganizer(owner)) {
      return 'Jesteś organizatorem tego wydarzenia.';
    }
    if (this.isAlreadyJoined(players)) {
      return 'Już zapisałeś się na to wydarzenie.';
    }
    if (players.length >= slots) {
      return 'Wszystkie miejsca są już zajęte.';
    }
    return '';
  }

  maxVotes(games: Game[]): number {
    if (!games || games.length === 0) return 0;
    return Math.max(...games.map(game => game.votes || 0));
  }

  resetAllFilters() {
    this.filter = {date: '', place: '', name:'', game: '', favorites: false}; // Wyzerowanie wszystkich filtrów
    this.applyFilters();
  }

  async openDateFilterModal() {
    const { value: date } = await Swal.fire({
      title: 'Wybierz datę',
      html: `
        <input type="date" id="swal-date" class="swal2-input" value="${this.filter.date || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Zastosuj',
      cancelButtonText: 'Anuluj',
      didOpen: () => {
        const dateInput = document.getElementById('swal-date') as HTMLInputElement;
        dateInput?.focus(); // Ustawienie kursora na kalendarzu
      },
      preConfirm: () => {
        const dateInput = document.getElementById('swal-date') as HTMLInputElement;
        if (!dateInput.value) {
          Swal.showValidationMessage('Musisz wybrać datę!');
          return false;
        }
        return dateInput.value;
      },
    });

    if (date) {
      this.setFilterDate(date);
      this.applyFilters();
    }
  }

  setFilterDate(value: string) {
    this.filter.date = value;
  }

  joinEvent(eventId: string | undefined, eventGames: Game[]) {
    if (!eventId) return;
    const event = this.events.find(e => e.id === eventId);
    if (!event) return;
    this.eventService.joinEvent(eventId, event.name, eventGames, this.currentUser, this.loadEvents.bind(this));
  }

  // modal do wyświetlenia zapisanych graczy
  viewPlayers(players: Players[]): void { 
    this.currentPlayers = players; // Przypisz listę graczy
    this.isModalOpen = true; // Otwórz modal
  }

  closeModal() {
    this.isModalOpen = false; // Zamknij modal
    this.currentPlayers = []; // Wyczyść listę graczy
  }

  openAddEvent() {
    this.eventService.openAddEventAlert(() => this.loadEvents());
  }

}