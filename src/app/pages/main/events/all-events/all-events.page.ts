import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { Event, Game } from 'src/app/models/events';
import { ModalController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { format } from 'date-fns';
import { ActionSheetController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { Router } from '@angular/router'


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
  }
  isLoading = false;
  isModalOpen = false; // Kontroluje stan modalu wyświetlającego zapisanych graczy
  currentPlayers: string[] = []; // Przechowuje listę graczy dla wybranego wydarzenia
  isDateFilterModalOpen = false; // Kontroluje stan modalu filtrowania po dacie
  log_in = false;
  currentUser: string = '';
  avatar: string = '';


  constructor(
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService, 
    private alertService: AlertService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private autentykacjaService: AutentykacjaService,
    private router: Router
  ) { }

  ngOnInit() {
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || 'Wszystkie spotkania';
    this.loadEvents();
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
      this.avatar = user.avatar;
    });
  }

  loadEvents() {
    this.isLoading = true;
    this.databaseService.getAllEvents().subscribe({
      next: (data) => {
         this.events = data.map((event) => ({
          ...event,
          games: event.games || [],
          registeredPlayers: event.players?.length || 0, // Dynamiczne obliczanie liczby graczy
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
    this.filteredEvents = this.events.filter((event) => {
      const matchesPlace = 
        this.filter.place === '' || event.place.toLowerCase().includes(this.filter.place.toLowerCase());
      const matchesName = 
        this.filter.name === '' || event.name.toLowerCase().includes(this.filter.name.toLowerCase());
      const matchesDate =
        !this.filter.date || format(new Date(this.filter.date), 'dd.MM.yyyy') === event.date;;
      return matchesPlace&&matchesName&&matchesDate;
    });
  }

  resetDateFilter() {
    this.filter.date = ''; // Wyzerowanie filtra daty
    this.applyFilters();
  }

  resetAllFilters() {
    this.filter = {date: '', place: '', name:'',}; // Wyzerowanie wszystkich filtrów
    this.applyFilters();
  }

  // Obsługa filtra daty
  openDateFilterModal() {
    this.isDateFilterModalOpen = true;
  }

  closeDateFilterModal() {
    this.isDateFilterModalOpen = false;
  }

  setFilterDate(value: string) {
    this.filter.date = value;
  }

  applyDateFilter() {
    this.closeDateFilterModal();
    this.applyFilters();
  }


  //funkcja zapisywania się na wydarzenie
  async joinEvent(eventId: string | undefined, eventGames: Game[]) {
    if (!eventId) {
      console.error('Brak ID wydarzenia');
      return;
    }

    // Znajdź zdarzenie na podstawie ID
    const event = this.events.find(e => e.id === eventId);
    if (!event) {
      console.error('Nie znaleziono wydarzenia.');
      return;
    }

    // Sprawdzenie, czy użytkownik jest organizatorem wydarzenia
    if (event.owner === this.currentUser) {
      await this.alertService.showAlert(
        'Informacja',
        'Nie możesz zapisać się na własne wydarzenie, ponieważ jesteś jego organizatorem.',
        'alert-warning'
      );
      return;
    }

    // Sprawdzenie, czy użytkownik jest już zapisany na to wydarzenie
    if (event.players && event.players.includes(this.currentUser)) {
      await this.alertService.showAlert(
        'Informacja',
        'Jesteś już zapisany na to wydarzenie.',
        'alert-warning'
      );
      return;
    }

    // Tworzenie alertu z opcjami gier
    const alert = await this.alertController.create({
      header: 'Wybierz preferowaną grę',
      inputs: eventGames.map((game, index) => ({
        type: 'radio',
        label: `${game.game} (${game.votes?.length || 0} wybór/ów)`,
        value: index, // Używamy indeksu jako wartości
      })),
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
        },
        {
          text: 'Zatwierdź',
          handler: (selectedIndex: number) => {
            const selectedGame = eventGames[selectedIndex];
            if (selectedGame) {
              this.databaseService.addPlayerToEventWithGame(eventId, this.currentUser, selectedGame.game).subscribe({
                next: async () => {
                  await this.alertService.showAlert(
                    'Sukces',
                    `Zapisano użytkownika ${this.currentUser} do wydarzenia`,
                    'alert-success'
                  );
                  this.loadEvents();
                },
                error: async () => {
                  await this.alertService.showAlert(
                    'Błąd',
                    'Nie udało się zapisać do wydarzenia',
                    'alert-error'
                  );
                },
              });
            }
          },
        },
      ],
    });
    await alert.present();
  }
  //Koniec funkcji dołączania do wydarzenia


  // modal do wyświetlenia zapisanych graczy
  viewPlayers(players: string[]) {
    this.currentPlayers = players; // Przypisz listę graczy
    this.isModalOpen = true; // Otwórz modal
  }

  closeModal() {
    this.isModalOpen = false; // Zamknij modal
    this.currentPlayers = []; // Wyczyść listę graczy
  }

  //Obsługa okienka do wprowadznia danych nowego spotkania
  async openAddEventAlert() {
    const alert = await this.alertController.create({
      header: 'Dodaj spotkanie',
      cssClass: 'wide-alert',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'Nazwa wydarzenia' },
        { name: 'date', type: 'date', placeholder: 'Data wydarzenia' },
        { name: 'time', type: 'time', placeholder: 'Godzina wydarzenia' },
        { name: 'place', type: 'text', placeholder: 'Miejsce wydarzenia' },
        { name: 'slots', type: 'number', placeholder: 'Liczba miejsc' },
        { name: 'details', type: 'textarea', placeholder: 'Szczegóły (opcjonalne)' },
        { name: 'games', type: 'text', placeholder: 'Podaj gry (oddziel przecinkami)' },
      ],
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          handler: () => true, // Zawsze zamykamy alert na anulowanie
        },
        {
          text: 'Dodaj',
          handler: (data) => {
            // Walidacja: sprawdzamy, czy wszystkie wymagane pola są wypełnione
            if (!data.name || !data.date || !data.time || !data.place || !data.slots || !data.games) {
              this.alertService.showAlert(
                'Błąd',
                'Wszystkie wymagane pola muszą być wypełnione!',
                'alert-error'
              );
              return false;
            }
            // Jeśli wszystkie pola są wypełnione, przetwarzamy dane

            // Tworzymy tablicę gier
            const gamesArray: Game[] = data.games.split(',').map((gameName: string) => ({
              game: gameName.trim(),
              votes: [],
            }));

             // Przechodzimy do wyboru preferowanej gry
            this.openPreferredGameAlert(data, gamesArray, alert);
            return false; // Nie zamykamy pierwszego alertu

          },
        },
      ],
    });

    await alert.present();
  }

  async openPreferredGameAlert(data: any, gamesArray: Game[], parentAlert: HTMLIonAlertElement) {
    const alert = await this.alertController.create({
      header: 'Wybierz preferowaną grę',
      inputs: gamesArray.map((game, index) => ({
        type: 'radio',
        label: game.game, // Wyświetlana nazwa gry
        value: index, // Indeks gry w tablicy
      })),
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          handler: () => true, // Zawsze zamykamy alert na anulowanie
        },
        {
          text: 'Zatwierdź',
          handler: (selectedIndex) => {
          
            // Sprawdzenie, czy wybrano indeks
            if (selectedIndex === undefined || selectedIndex < 0 || selectedIndex >= gamesArray.length) {
              this.alertService.showAlert(
                'Błąd',
                'Musisz wybrać preferowaną grę!',
                'alert-error'
              );
              return false; // Zatrzymaj zamykanie alertu
            }

            // Sprawdzenie, czy `votes` istnieje i inicjalizacja, jeśli nie
            if (!gamesArray[selectedIndex].votes) {
              gamesArray[selectedIndex].votes = [];
            }

            // Dodanie preferowanej gry do listy głosów
            gamesArray[selectedIndex].votes.push(this.currentUser);
            
            // Dodajemy wydarzenie z preferowaną grą
            this.addEvent({
              ...data,
              games: gamesArray,
            });

            // Ręczne zamknięcie pierwszego alertu
            parentAlert.dismiss();

            return true; // Zamykamy alert po poprawnym wyborze
          },
        },
      ],
    });
    await alert.present();
  }
  
  //Funkcja dodawania nowego wydarenia
  addEvent(data: any) {
    
    // Tworzenie obiektu nowego wydarzenia zgodnie z interfejsem Event
    const newEvent: Event = {
      name: data.name,
      date: format(new Date(data.date), 'dd.MM.yyyy'),
      time: data.time,
      place: data.place,
      slots: Number(data.slots),
      owner: this.currentUser,
      details: data.details || '',
      players: [],
      games: data.games,
    };

    // Dodanie wydarzenia do bazy danych
    this.databaseService.addEvent(newEvent).subscribe({
      next: () => {
        this.alertService.showAlert(
          'Sukces',
          'Wydarzenie zostało dodane pomyślnie!',
          'alert-success'
        );
        this.loadEvents(); // Odświeżenie listy wydarzeń
      },
      error: (err) => {
        console.error('Błąd podczas dodawania wydarzenia:', err);
        this.alertService.showAlert(
          'Błąd',
          'Nie udało się dodać wydarzenia. Spróbuj ponownie.',
          'alert-error'
        );
      },
    });
  }


}