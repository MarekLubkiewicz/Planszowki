import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, mapTo, Observable, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Event } from '../models/events';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private baseUrl = environment.firebaseDatabaseURL;

  constructor(private http: HttpClient) {}

  // Pobieranie wszystkich wydarzeń
  getAllEvents(): Observable<Event[]> {
    return this.http.get<{ [key: string]: Event }>(`${this.baseUrl}/Events.json`).pipe(
      map((data) => {
        return Object.keys(data || {}).map((key) => ({
          id: key, // Klucz staje się ID wydarzenia
          ...data[key], // Rozwijamy pozostałe właściwości
        }));
      })
    );
  }

  // Zapisywanie do wydarzenia
  addPlayerToEvent(eventId: string, player: string): Observable<void> {
    const url = `${this.baseUrl}/Events/${eventId}/players.json`;

    // Pobierz aktualną listę graczy, dodaj nowego, a następnie zapisz
    return this.http.get<string[]>(url).pipe(
      switchMap((players) => {
        const updatedPlayers = players ? [...players, player] : [player];
        return this.http.put<void>(url, updatedPlayers); // Użyj PUT, aby nadpisać tablicę graczy
      })
    );
  }

  addPlayerToEventWithGame(eventId: string, player: string, gameKey: string): Observable<void> {
    const urlPlayers = `${this.baseUrl}/Events/${eventId}/players.json`;
    const urlGameRate = `${this.baseUrl}/Events/${eventId}/games/${gameKey}/rate.json`;

    // Pobierz aktualną listę graczy
    return this.http.get<string[]>(urlPlayers).pipe(
      switchMap((players) => {
        const updatedPlayers = players ? [...players, player] : [player];

        // Zaktualizuj liczbę wybranej gry
        return this.http.get<number>(urlGameRate).pipe(
          switchMap((currentRate) => {
            const updatedRate = (currentRate || 0) + 1;

            // Wyślij obie aktualizacje równocześnie
            const updateRequests = [
              this.http.put<void>(urlPlayers, updatedPlayers),
              this.http.put<void>(urlGameRate, updatedRate),
            ];
            return forkJoin(updateRequests).pipe(mapTo(void 0));
          })
        );
      })
    );
  }

  // Dodawanie nowego wydarzenia
  addEvent(event: Event): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(`${this.baseUrl}/Events.json`, event);
  }

  // Aktualizacja istniejącego wydarzenia
  updateEvent(id: string, event: Event): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/Events/${id}.json`, event);
  }


  // Usuwanie wydarzenia
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Events/${id}.json`);
  }

}
