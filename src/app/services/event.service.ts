import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { format } from 'date-fns';
import { DatabaseService } from './database.service';

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
          handler: (data) => {
            if (!data.name || !data.date || !data.time || !data.place || !data.slots || !data.games) {
              Swal.fire({ title: 'Błąd', text: 'Wszystkie wymagane pola muszą być wypełnione!', icon: 'error' });
              return false;
            }
            const gamesArray: string[] = data.games.split(',').map((game: string) => game.trim());

            this.openPreferredGameAlert(data, gamesArray, alert, loadEvents);
            return false;
          },
        },
      ],
    });

    await alert.present();
  }

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
