import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Event, Players } from 'src/app/models/events';
import Swal from 'sweetalert2';

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
  events: Event[] = [];
  eventsJoin: Event[] = [];
  isModalOpen = false; // Kontroluje stan modalu wyświetlającego zapisanych graczy
  currentPlayers: Players[] = []; // Przechowuje listę graczy dla wybranego wydarzenia
  defaultAvatar = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  

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
    this.databaseService.getAllEvents().subscribe({
      next: (data) => {
        // Filtrujemy wydarzenia, aby zostawić tylko te, gdzie użytkownik jest zapisany
        this.eventsJoin = data
          .filter(event => 
            event.owner !== this.currentUser && 
            event.players?.some(playerObj => playerObj.player === this.currentUser))
          .map((event) => ({
            ...event,
            games: event.games || [],
            registeredPlayers: event.players?.length ?? 0, // Dynamiczne obliczanie liczby graczy
          }));
        this.isLoading = false;
      },
      error: (error) => {
        Swal.fire('Błąd', `Błąd podczas pobierania wydarzeń: ${error}`, 'error');
        this.isLoading = false;
        this.eventsJoin = []; // Wyczyść listę w przypadku błędu
      },
    });
  }

  removeFromEvent(eventId: string) {
    Swal.fire({
      title: 'Uwaga',
      text: 'Czy na pewno chcesz się wypisać?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Tak',
      cancelButtonText: 'Nie'
    }).then((result) => {
      if (result.isConfirmed) {
        const eventIdDoWyslania = { 'eventId': eventId };
        const eventToRemove = this.eventsJoin.find(event => event.id === eventId);
        this.databaseService.removePlayerFromEvent(eventIdDoWyslania).subscribe({
        next: () => {
          this.eventsJoin = this.eventsJoin.filter(event => event.id !== eventId);
          Swal.fire('OK!', `${this.currentUser} wypisałeś/aś się ze spotkania ${eventToRemove?.name}`, 'success');
          },
          error: (error) => {
            Swal.fire('Ups ..!',`Nie udało się wypisać: ${error}`, 'error');
          }
        });
      }
    });
  }


  // modal do wyświetlenia zapisanych graczy
  viewPlayers(players: Players[]) {
    this.currentPlayers = players; // Przypisz listę graczy
    this.isModalOpen = true; // Otwórz modal
  }

  closeModal() {
    this.isModalOpen = false; // Zamknij modal
    this.currentPlayers = []; // Wyczyść listę graczy
  }
  

}
