import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from '../models/events';


@Injectable({
  providedIn: 'root',
})
export class DatabaseService {


  //private apiUrl = 'http://127.0.0.1:5000';
  private apiUrl = 'https://www.vanilladice.pl/bg-test';

  constructor(private http: HttpClient) {}


  // PODŁĄCZENIE DO BAZY SQL

  // Dodawanie nowego wydarzenia
  addEvent(event: Event): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(`${this.apiUrl}/zapisz-wydarzenie`, event, { withCredentials: true });
  }

  // Pobieranie wszystkich wydarzeń
  getAllEvents(): Observable<Event[]> {
    return this.http.get<{ [key: string]: Event }>(`${this.apiUrl}/wydarzenia`, { withCredentials: true }).pipe(
      map((data) => {
        const events = Object.keys(data || {}).map((key) => ({
          id: key, // Klucz staje się ID wydarzenia
          ...data[key],
        }));
        return events;
      })
    );
  }

  //Zapisywanie się na wydarzenie
  addPlayerToEvent(eventId: string, player: string, selectedGame: string ): Observable<void> {
    const userData = { eventId, player, selectedGame };
    return this.http.post<void>(`${this.apiUrl}/zapisz-do-gry`, userData, { withCredentials: true });
  }

  // Usunięcie gracza z wydarzenia 
  removePlayerFromEvent(eventIdDoWyslania: { 'eventId': string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/usun-mnie-z-gry`, eventIdDoWyslania, { withCredentials: true });
  }

  // Usuwanie wydarzenia
  deleteEvent(eventIdDoWyslania: { 'eventId': string }): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/usun-wydarzenie`, eventIdDoWyslania, { withCredentials: true });
  }

  // Aktualizacja istniejącego wydarzenia
  updateEvent(event: Event): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/modyfikuj-wydarzenie`, event, { withCredentials: true });
  }

}
