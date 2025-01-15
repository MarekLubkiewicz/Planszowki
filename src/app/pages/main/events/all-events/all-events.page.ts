import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatabaseService } from 'src/app/services/database.service';
import { Event } from 'src/app/models/events';
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
    this.title = this.activatedRoute.snapshot.queryParamMap.get('title') || 'Wszystkie wydarzenia';
    this.loadEvents();
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
      this.log_in = user.zalogowany;
    });
  }

  loadEvents() {
    this.isLoading = true;
    this.databaseService.getAllEvents().subscribe({
      next: (data) => {
         this.events = data.map((event) => ({
          ...event,
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
  async joinEvent(eventId: string | undefined, eventGames: any) {
  
    
    if (!eventId) {
      console.error('Brak ID wydarzenia');
      return;
    }


    // Walidacja zapisu na spotkanie
    // Znajdź zdarzenie na podstawie ID
    const event = this.events.find(e => e.id === eventId);

      // Jeśli wydarzenie nie zostało znalezione, przerwij wykonanie
    if (!event) {
      console.error('Nie znaleziono wydarzenia.');
      return;
    }

    // Przerwanie wykonania i wyświetlenie komunikatu pzry spełnieniu warunku
    if (event.players && event.players.includes(this.currentUser)) {
      await this.alertService.showAlert(
        'Informacja',
        'Jesteś już zapisany na to wydarzenie.',
        'alert-warning'
      );
      return;
    }
    //koniec walidacji

    const alert = await this.alertController.create({
      header: 'Wybierz preferowaną grę',
      inputs: Object.keys(eventGames).map((key) => ({
        type: 'radio',
        label: `${eventGames[key].game} (${eventGames[key].rate || 0} wybór/ów)`,
        value: key,
      })),
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
        },
        {
          text: 'Zatwierdź',
          handler: (selectedGame) => {
            if (selectedGame) {
              this.databaseService.addPlayerToEventWithGame(eventId, this.currentUser, selectedGame).subscribe({
                next: async () => {
                  await this.alertService.showAlert(
                  'Sukces',
                  `Zapisano użytkownika ${this.currentUser} do wydarzenia`, 
                  'alert-success');
                  this.loadEvents();
                },
                error: async (err) => {
                  await this.alertService.showAlert('Bład',`Nie udało się zapisać do wydarzenia`, 'alert-error');
                },
              });
            }
          },
        },
      ],
    });
    await alert.present()
  }



  viewPlayers(players: string[]) {
    this.currentPlayers = players; // Przypisz listę graczy
    this.isModalOpen = true; // Otwórz modal
  }

  closeModal() {
    this.isModalOpen = false; // Zamknij modal
    this.currentPlayers = []; // Wyczyść listę graczy
  }

}