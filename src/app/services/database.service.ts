import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, mapTo, Observable, switchMap } from 'rxjs';
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
    return this.http.post<{ name: string }>(`${this.apiUrl}/zapisz-wydarzenie`, event);
  }


  // Pobieranie wszystkich wydarzeń
  getAllEvents(): Observable<Event[]> {
    return this.http.get<{ [key: string]: Event }>(`${this.apiUrl}/wydarzenia.json`).pipe(
      map((data) => {
        return Object.keys(data || {}).map((key) => ({
          id: key, // Klucz staje się ID wydarzenia 
          ...data[key], // Rozwijamy pozostałe właściwości
        }));
      })
    );
  }




  // ---------------------------------------------------------------------------------

  /*

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
  }*/

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

  // Dodanie gracza do wydarzenia z głosowaniem na grę

  /*
  addPlayerToEventWithGame(eventId: string, player: string, selectedGameName: string): Observable<void> {
    const urlPlayers = `${this.baseUrl}/Events/${eventId}/players.json`;
    const urlGames = `${this.baseUrl}/Events/${eventId}/games.json`;
    // Pobierz aktualną listę graczy  
    return this.http.get<string[]>(urlPlayers).pipe(
      switchMap((players) => {
        const updatedPlayers = players ? [...players, player] : [player];
        // Pobierz aktualną listę głosów na grę
        return this.http.get<Game[]>(urlGames).pipe(
          switchMap((games) => {
            const updatedGames = games.map((game) => {
              if (game.game === selectedGameName) {
                return { ...game, votes: [...(game.votes || []), player] };
              }
              return game;
            });
            // Wyślij obie aktualizacje równocześnie
            return forkJoin([
              this.http.put<void>(urlPlayers, updatedPlayers), // Aktualizacja listy graczy
              this.http.put<void>(urlGames, updatedGames), // Aktualizacja głosów na grę
            ]).pipe(mapTo(void 0));
          })
        );
      })
    );
  } */

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

  // Dodawanie nowego wydarzenia
  /*
  addEvent(event: Event): Observable<{ name: string }> {
    return this.http.post<{ name: string }>(`${this.baseUrl}/Events.json`, event);
  }
  */

  // Aktualizacja istniejącego wydarzenia
  updateEvent(id: string, event: Event): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/Events/${id}.json`, event);
  }

  // Usuwanie wydarzenia
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/Events/${id}.json`);
  }

}
