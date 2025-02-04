import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Event, Players, Game } from 'src/app/models/events';
import { AlertController } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';

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
    private alertService: AlertService,     
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


  deleteEvent(eventId: string) {
    if (confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {

      const eventIdDoWyslania = { 'eventId': eventId };

      this.databaseService.deleteEvent(eventIdDoWyslania).subscribe({
        next: () => {
          this.myEvents = this.myEvents.filter(event => event.id !== eventId);
          console.log('Wydarzenie zostało usunięte.');
        },
        error: (error) => {
          console.error('Błąd podczas usuwania wydarzenia:', error);
        }
      });
    }
  }

  async editEvent(event: Event) {
    const alert = await this.alertController.create({
      header: 'Edytuj wydarzenie',
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
          value: event.date,
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
              date: data.date,
              time: data.time,
              place: data.place,
              slots: Number(data.slots),
              details: data.details
            };

            this.databaseService.updateEvent(updatedEvent).subscribe({
              next: () => {
                // Aktualizacja listy wydarzeń
                this.myEvents = this.myEvents.map(ev => ev.id === updatedEvent.id ? updatedEvent : ev);
                this.alertService.showAlert(
                  'Sukces',
                  'Wydarzenie zostało zaktualizowane',
                  'alert-success'
                );
              },
              error: (err) => {
                console.error('Błąd podczas aktualizacji wydarzenia:', err);
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
