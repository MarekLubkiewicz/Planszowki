import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Event, Players, Game } from 'src/app/models/events';
import { AlertController } from '@ionic/angular';
import { format, parse } from 'date-fns';
import { EventService } from 'src/app/services/event.service';
import Swal from 'sweetalert2';

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
  isModalOpen = false; // Kontroluje stan modalu wyświetlającego zapisanych graczy
  currentPlayers: Players[] = []; // Przechowuje listę graczy dla wybranego wydarzenia
  defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private activatedRoute: ActivatedRoute,
    private autentykacjaService: AutentykacjaService,
    private databaseService: DatabaseService,
    private alertController: AlertController,
    private eventService: EventService,
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
    this.databaseService.getAllEvents().subscribe({
      next: (data) => {
        // Filtrujemy wydarzenia, aby zostawić tylko te, gdzie użytkownik jest organizatorem
        this.myEvents = data
          .filter(event => event.owner === this.currentUser)
          .map((event) => ({
            ...event,
            games: event.games || [],
            registeredPlayers: event.players?.length ?? 0, // Dynamiczne obliczanie liczby graczy
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

  openAddEvent() {
    this.eventService.openAddEventAlert(() => this.loadMyEvents());
  }

  deleteEvent(eventId: string) {
    Swal.fire({
      title: 'Czy na pewno chcesz usunąć?',
      text: 'Tej operacji nie można cofnąć!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then((result) => {
      if (result.isConfirmed) {
        // Wyświetlenie ładowania
        Swal.fire({
          title: 'Usuwanie...',
          text: 'Proszę czekać',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading(null);
          }
        });
        const eventIdDoWyslania = { eventId };
        this.databaseService.deleteEvent(eventIdDoWyslania).subscribe({
          next: () => {
            this.myEvents = this.myEvents.filter(event => event.id !== eventId);
            Swal.fire('Usunięto!', `Spotkanie zostało usunięte.`, 'success');
          },
          error: (error) => {
            Swal.fire('Błąd!',`Nie udało się usunąć spotkania: ${error}`, 'error');
          }
        });
      }
    });
  }


  async editEvent(event: Event) {

    const formattedDate = event.date 
    ? format(parse(event.date, 'dd.MM.yyyy', new Date()), 'yyyy-MM-dd') : '';

    const alert = await this.alertController.create({
      header: 'Edytuj spotkanie',
      cssClass: 'wide-alert',
      inputs: [
        {
          name: 'name',
          type: 'text',
          value: event.name,
          placeholder: 'Nazwa wydarzenia'
        },
        {
          name: 'date',
          type: 'date',
          value: formattedDate,
          placeholder: 'Data wydarzenia'
        },
        {
          name: 'time',
          type: 'time',
          value: event.time,
          placeholder: 'Godzina wydarzenia'
        },
        {
          name: 'place',
          type: 'text',
          value: event.place,
          placeholder: 'Miejsce wydarzenia'
        },
        {
          name: 'slots',
          type: 'number',
          value: event.slots,
          placeholder: 'Liczba miejsc'
        },
        {
          name: 'details',
          type: 'textarea',
          value: event.details || '',
          placeholder: 'Dodatkowe informacje'
        }
      ],
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel'
        },
        {
          text: 'Zapisz',
          handler: (data) => {
            const updatedEvent: Event = {
              ...event, // Zachowujemy resztę właściwości
              name: data.name,
              date: format(new Date(data.date), 'dd.MM.yyyy'),
              time: data.time,
              place: data.place,
              slots: Number(data.slots),
              details: data.details
            };

            this.databaseService.updateEvent(updatedEvent).subscribe({
              next: () => {
                // Aktualizacja listy wydarzeń
                this.myEvents = this.myEvents.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev);
                Swal.fire('Brawo', `Spotkanie "${event.name}" zostało zaktualizowane.`, 'success');
              },
              error: (error) => {
                Swal.fire('Błąd!',`Nie udało się zaktulizować spotkania: ${error}`, 'error');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // modal do wyświetlenia zapisanych graczy
  viewPlayers(players: Players[]): void { //sprawdzić czy void jest potrzebne~!!!!!!
    this.currentPlayers = players; // Przypisz listę graczy
    this.isModalOpen = true; // Otwórz modal
  }

  closeModal() {
    this.isModalOpen = false; // Zamknij modal
    this.currentPlayers = []; // Wyczyść listę graczy
  }
  
}
