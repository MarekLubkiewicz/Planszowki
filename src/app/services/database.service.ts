import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, mapTo, Observable, switchMap, throwError, BehaviorSubject } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Event, Game } from '../models/events';


@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private baseUrl = environment.firebaseDatabaseURL;


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

  // ---------------------------------------------------------------------------------



  getMyEvents(currentUser: string): Observable<Event[]> {
    return this.http.get<{ [key: string]: Event }>(`${this.baseUrl}/Events.json`).pipe(
        map((data) => {
          const events = Object.keys(data || {}).map((key) => ({
              id: key,
              ...data[key],
            }))
          return events.filter((event) => event.owner === currentUser);
        })
      );
  }

  getMyJoinEvents(currentUser: string): Observable<Event[]> {
    return this.http.get<{ [key: string]: Event }>(`${this.baseUrl}/Events.json`).pipe(
        map((data) => {
          const events = Object.keys(data || {}).map((key) => ({
              id: key,
              ...data[key],
            }))
          return events.filter((event) => event.players?.includes(currentUser));
        })
      );
  }


  // Usunięcie gracza z wydarzenia oraz głosu na grę

  removePlayerFromEvent(eventId: string, player: string, gameKey: string): Observable<void> {
    const urlPlayers = `${this.baseUrl}/Events/${eventId}/players.json`;
    const urlGameVotes = `${this.baseUrl}/Events/${eventId}/games/${gameKey}/votes.json`;

    return this.http.get<string[]>(urlPlayers).pipe(
      switchMap((players) => {
        console.log('Gracze przed aktualizacją:', players);
        const updatedPlayers = players ? players.filter((p) => p !== player) : [];
        console.log('Zaktualizowana lista graczy:', updatedPlayers);

        return this.http.get<string[]>(urlGameVotes).pipe(
          switchMap((votes) => {
            console.log('Głosy przed aktualizacją:', votes);
            const updatedVotes = votes ? votes.filter((v) => v !== player) : [];
            console.log('Zaktualizowana lista głosów:', updatedVotes);

            const updateRequests = [
              this.http.put<void>(urlPlayers, updatedPlayers),
              this.http.put<void>(urlGameVotes, updatedVotes),
            ];
            return forkJoin(updateRequests).pipe(mapTo(void 0));
          })
        );
      })
    );
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
