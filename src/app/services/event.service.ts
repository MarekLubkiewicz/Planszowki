import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { format } from 'date-fns';
import { DatabaseService } from './database.service';
import { Game } from '../models/events';
import { AutentykacjaService } from 'src/app/services/autentykacja.service';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class EventService {
  currentUser: string = '';

  constructor(
    private alertController: AlertController, 
    private databaseService: DatabaseService,
    private autentykacjaService: AutentykacjaService
  ) {}

  async openAddEventAlert(loadEvents: () => void) {
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
          handler: () => true,
        },
        {
          text: 'Dodaj',
          handler: async (data) => {
            if (!data.name || !data.date || !data.time || !data.place || !data.slots || !data.games) {
              Swal.fire({ title: 'Błąd', text: 'Wszystkie wymagane pola muszą być wypełnione!', icon: 'error' });
              return false;
            }
            const gamesArray: string[] = data.games.split(',').map((game: string) => game.trim());

            if (gamesArray.length === 1) {
            // Jeśli jest tylko jedna gra, przypisujemy ją automatycznie i pomijamy alert wyboru
              await alert.dismiss();
              this.addEvent({ ...data, games: gamesArray, chosen_game: gamesArray[0] }, loadEvents);
            } else {
              // Jeśli jest więcej gier, otwieramy alert wyboru preferowanej gry
              //this.openPreferredGameAlert(data, gamesArray, alert, loadEvents);
                await this.openPreferredGameAlert(gamesArray, (selectedGame) => {
              this.addEvent({ ...data, games: gamesArray, chosen_game: selectedGame }, loadEvents);
            });
            }
            return false;
          },
        },
      ],
    });

    await alert.present();
  }

  /*

  async openPreferredGameAlert(data: any, gamesArray: string[], parentAlert: HTMLIonAlertElement, loadEvents: () => void) {
    const alert = await this.alertController.create({
      header: 'Wybierz preferowaną grę',
      inputs: gamesArray.map(game => ({
        type: 'radio',
        label: game,
        value: game,
      })),
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          handler: () => true,
        },
        {
          text: 'Zatwierdź',
          handler: (selectedGame) => {
            if (!selectedGame) {
              Swal.fire({ title: 'Błąd', text: 'Musisz wybrać preferowaną grę!', icon: 'error' });
              return false;
            }

            this.addEvent({ ...data, games: gamesArray, chosen_game: selectedGame }, loadEvents);
            parentAlert.dismiss();
            return true;
          },
        },
      ],
    });

    await alert.present();
  }*/
  async openPreferredGameAlert(
    gamesArray: string[], 
    onConfirm: (selectedGame: string) => void
    ) {
    const alert = await this.alertController.create({
      header: 'Wybierz preferowaną grę',
      inputs: gamesArray.map(game => ({
        type: 'radio',
        label: game,
        value: game,
      })),
      buttons: [
        {
          text: 'Anuluj',
          role: 'cancel',
          handler: () => true,
        },
        {
          text: 'Zatwierdź',
          handler: (selectedGame: string) => {
            if (!selectedGame) {
              Swal.fire({ title: 'Błąd', text: 'Musisz wybrać preferowaną grę!', icon: 'error' });
              return false;
            }
            onConfirm(selectedGame);
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async joinEvent(eventId: string | undefined, eventName: string, eventGames: Game[], currentUser: string, loadEvents: () => void) {
    if (!eventId) {
      console.error('Brak ID wydarzenia');
      return;
    }

    if (eventGames.length === 1) {
      // Jeśli jest tylko jedna gra, zapisujemy użytkownika od razu
      this.addPlayer(eventId, eventName, currentUser, eventGames[0].game, loadEvents);
      return;
    }

    // Używamy openPreferredGameAlert
    await this.openPreferredGameAlert(eventGames.map(g => g.game), (selectedGame) => {
      this.addPlayer(eventId, eventName, currentUser, selectedGame, loadEvents);
    });
  }

  private addPlayer(eventId: string, eventName: string, user: string, chosenGame: string, loadEvents: () => void) {
    this.databaseService.addPlayerToEvent(eventId, user, chosenGame).subscribe({
      next: async () => {
        Swal.fire({
          title: 'Sukces',
          text: `${user}, zapisałeś się na spotkanie: ${eventName}`,
          icon: 'success',
          confirmButtonText: 'OK'
        });
        loadEvents();
      },
      error: async () => {
        Swal.fire({
          title: 'Błąd',
          text: 'Nie udało się zapisać na spotkanie',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      },
    });
  }

  addEvent(data: any, loadEvents: () => void) {
    
    this.autentykacjaService.user$.subscribe(user => {
      this.currentUser = user.uzytkownik;
    });
    
    const newEvent = {
      name: data.name,
      date: format(new Date(data.date), 'dd.MM.yyyy'),
      time: data.time,
      place: data.place,
      slots: Number(data.slots),
      owner: this.currentUser,
      details: data.details || '',
      games: data.games,
      chosen_game: data.chosen_game,
    };

    this.databaseService.addEvent(newEvent).subscribe({
      next: () => {
        Swal.fire({ title: 'Brawo', text: `Zaplanowałeś nowe spotkanie: ${newEvent.name}`, icon: 'success' });
        loadEvents();
      },
      error: () => {
        Swal.fire({ title: 'Błąd', text: 'Nie udało się dodać wydarzenia. Spróbuj ponownie.', icon: 'error' });
      },
    });
  }


}
