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
  private events = new BehaviorSubject<Event[]>([]);
  events$ = this.events.asObservable(); // Eksponujemy dane jako Observable

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
        this.events.next(events); // Ustawiamy załadowane wydarzenia
        return events;
      })
    );
  }


  //Zapisywanie się na wydarzenie
  addPlayerToEventWithGame(
    eventId: string,
    player: string,
    selectedGame: string
  ): Observable<void> {
    // Znajdź wydarzenie na podstawie eventId w załadowanych danych
    return this.events$.pipe(
      map((events: Event[]) => {
        const event = events.find((e: Event) => e.id === eventId);

        if (!event) {
          throw new Error(`Wydarzenie o ID ${eventId} nie zostało znalezione.`);
        }

        // Przygotowanie danych do wysłania
        const requestBody = {
          eventId,
          player,
          selectedGame,
        };

        return requestBody;
      }),
      switchMap((requestBody) =>
        this.http.post<void>(`${this.apiUrl}/zapisz-do-gry`, requestBody).pipe(
          tap(() => {
            console.log(
              `Gracz ${player} zapisany na wydarzenie ${eventId} z wybraną grą ${selectedGame}`
            );
          }),
          catchError((error) => {
            console.error(
              'Błąd podczas zapisywania gracza na wydarzenie:',
              error
            );
            return throwError(() => error);
          })
        )
      )
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
    // Znajdź wydarzenie na podstawie eventId w załadowanych danych
    const event = this.events.find((e) => e.id === eventId);

    if (!event) {
      return throwError(() => new Error(`Wydarzenie o ID ${eventId} nie zostało znalezione.`));
    }

    // Aktualizuj listę graczy
    const updatedPlayers = event.players ? [...event.players, player] : [player];

    // Aktualizuj listę gier z głosami
    const updatedGames = event.games.map((game) => {
      if (game.game === selectedGameName) {
        return { ...game, votes: (game.votes || 0) + 1 }; // Zwiększamy liczbę głosów o 1
      }
      return game;
    });

    // Zaktualizuj dane na serwerze (tylko zmienione pola)
    const urlPlayers = `${this.baseUrl}/Events/${eventId}/players.json`;
    const urlGames = `${this.baseUrl}/Events/${eventId}/games.json`;

    return forkJoin([
      this.http.put<void>(urlPlayers, updatedPlayers), // Aktualizacja listy graczy
      this.http.put<void>(urlGames, updatedGames), // Aktualizacja listy gier
    ]).pipe(mapTo(void 0));
  }
*/

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
